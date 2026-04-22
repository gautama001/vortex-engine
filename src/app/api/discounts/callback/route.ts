import { NextRequest, NextResponse } from "next/server";
import { StoreStatus } from "@prisma/client";

import { logger } from "@/lib/logger";
import {
  type TiendaNubeDiscountCallbackPayloadBody,
  type TiendaNubeDiscountCommand,
} from "@/lib/tiendanube/types";
import { getStoreByTiendaNubeId } from "@/services/store-service";
import {
  extractPromotionId,
  getCachedStoreDiscountIntegration,
  normalizePromotionId,
} from "@/services/tiendanube-discount-integration-service";
import { listActiveOfferSessionsByStore } from "@/services/vortex-discount-service";

export const runtime = "nodejs";

const normalizeDiscountLocale = (language: string | null | undefined): string => {
  const normalized = String(language ?? "")
    .trim()
    .toLowerCase();

  if (normalized.startsWith("pt")) {
    return "pt-br";
  }

  if (normalized.startsWith("en")) {
    return "en";
  }

  return "es-ar";
};

const buildDisplayText = (
  language: string | null | undefined,
  storeId: string,
): Record<string, string> => {
  const label = `Promo Vortex ${storeId}`;
  const locale = normalizeDiscountLocale(language);

  return {
    [locale]: label,
  };
};

const normalizeNumber = (value: unknown): number | null => {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const toMoneyString = (value: number): string => {
  return value.toFixed(2);
};

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  let payload: TiendaNubeDiscountCallbackPayloadBody;

  try {
    payload = (await request.json()) as TiendaNubeDiscountCallbackPayloadBody;
  } catch {
    return NextResponse.json(
      {
        error: "invalid_payload",
      },
      { status: 400 },
    );
  }

  const storeId = String(payload.store_id ?? "").trim();
  const executionTier = payload.execution_tier ?? payload.allocation_type ?? null;
  const cartProducts = Array.isArray(payload.products)
    ? payload.products
    : Array.isArray(payload.line_items)
      ? payload.line_items
      : [];
  const cachedIntegration = storeId ? getCachedStoreDiscountIntegration(storeId) : null;

  if (executionTier !== "line_item") {
    logger.info("Ignoring TiendaNube discount callback for unsupported tier", {
      durationMs: Date.now() - startedAt,
      executionTier,
      storeId,
    });
    return new NextResponse(null, { status: 204 });
  }

  if (!storeId) {
    return NextResponse.json(
      {
        error: "missing_store_id",
      },
      { status: 400 },
    );
  }

  const activeSessionsPromise = listActiveOfferSessionsByStore(storeId);
  const store =
    cachedIntegration?.promotionId && cachedIntegration.status !== StoreStatus.UNINSTALLED
      ? null
      : await getStoreByTiendaNubeId(storeId);

  if (!cachedIntegration?.promotionId && !store) {
    return NextResponse.json(
      {
        error: "store_not_found",
      },
      { status: 404 },
    );
  }

  if (
    cachedIntegration?.status === StoreStatus.UNINSTALLED ||
    store?.status === StoreStatus.UNINSTALLED
  ) {
    return NextResponse.json(
      {
        error: "store_uninstalled",
      },
      { status: 310 },
    );
  }

  const promotionId = normalizePromotionId(
    cachedIntegration?.promotionId ?? store?.discountPromotionId ?? null,
  );

  if (!promotionId) {
    logger.info("Ignoring TiendaNube discount callback without persisted promotion id", {
      cachedPromotionId: cachedIntegration?.promotionId ?? null,
      durationMs: Date.now() - startedAt,
      executionTier,
      storedPromotionId: store?.discountPromotionId ?? null,
      storeId,
    });
    return new NextResponse(null, { status: 204 });
  }

  const activeSessions = await activeSessionsPromise;
  const commands: TiendaNubeDiscountCommand[] = [];
  const commandDiagnostics: Array<{
    discountValue: number;
    kind: "create_or_update_discount" | "remove_discount" | "skip";
    lineItemIds: string[];
    rewardProductId: string;
    selectedVariantId: string | null;
    sessionId: string;
    triggerMatched: boolean;
    triggerProductId: string;
  }> = [];
  const promotionIsActive = payload.promotions?.some(
    (promotion) => extractPromotionId(promotion) === promotionId,
  );

  for (const session of activeSessions) {
    const triggerPresent = cartProducts.some(
      (product) => String(product.product_id ?? product.id ?? "") === session.triggerProductId,
    );
    const rewardItems = cartProducts.filter((product) => {
      const rewardProductMatches =
        String(product.product_id ?? product.id ?? "") === session.rewardProductId;

      if (!rewardProductMatches) {
        return false;
      }

      if (!session.selectedVariantId) {
        return true;
      }

      return String(product.variant_id ?? "") === session.selectedVariantId;
    });

    if (!triggerPresent || rewardItems.length === 0) {
      if (promotionIsActive && rewardItems.length > 0) {
        const lineItemIds = rewardItems
          .map((item) => String(item.id ?? ""))
          .filter(Boolean);

        commands.push({
          command: "remove_discount",
          specs: {
            line_items: lineItemIds,
            promotion_id: promotionId,
            scope: "line_item",
          },
        });

        commandDiagnostics.push({
          discountValue: session.discountValue,
          kind: "remove_discount",
          lineItemIds,
          rewardProductId: session.rewardProductId,
          selectedVariantId: session.selectedVariantId,
          sessionId: session.id,
          triggerMatched: triggerPresent,
          triggerProductId: session.triggerProductId,
        });
      } else {
        commandDiagnostics.push({
          discountValue: session.discountValue,
          kind: "skip",
          lineItemIds: rewardItems
            .map((item) => String(item.id ?? ""))
            .filter(Boolean),
          rewardProductId: session.rewardProductId,
          selectedVariantId: session.selectedVariantId,
          sessionId: session.id,
          triggerMatched: triggerPresent,
          triggerProductId: session.triggerProductId,
        });
      }

      continue;
    }

    const lineItems = rewardItems
      .map((item) => {
        const lineItemId = String(item.id ?? "");
        const quantity = Math.max(1, normalizeNumber(item.quantity) ?? 1);
        const unitPrice = normalizeNumber(item.price) ?? 0;
        const discountAmount = (unitPrice * quantity * session.discountValue) / 100;

        if (!lineItemId || discountAmount <= 0) {
          return null;
        }

        return {
          discount_specs: {
            amount: toMoneyString(discountAmount),
            type: "fixed" as const,
          },
          line_item: lineItemId,
        };
      })
      .filter(
        (
          item,
        ): item is {
          discount_specs: {
            amount: string;
            type: "fixed";
          };
          line_item: string;
        } => Boolean(item),
      );

    if (lineItems.length > 0) {
      commands.push({
        command: "create_or_update_discount",
        specs: {
          currency: payload.currency,
          display_text: buildDisplayText(payload.language, storeId),
          line_items: lineItems,
          promotion_id: promotionId,
        },
      });

      commandDiagnostics.push({
        discountValue: session.discountValue,
        kind: "create_or_update_discount",
        lineItemIds: lineItems.map((item) => item.line_item),
        rewardProductId: session.rewardProductId,
        selectedVariantId: session.selectedVariantId,
        sessionId: session.id,
        triggerMatched: triggerPresent,
        triggerProductId: session.triggerProductId,
      });
      continue;
    }

    commandDiagnostics.push({
      discountValue: session.discountValue,
      kind: "skip",
      lineItemIds: [],
      rewardProductId: session.rewardProductId,
      selectedVariantId: session.selectedVariantId,
      sessionId: session.id,
      triggerMatched: triggerPresent,
      triggerProductId: session.triggerProductId,
    });
  }

  if (commands.length === 0) {
    logger.info("No discount actions required for TiendaNube callback", {
      cartProductCount: cartProducts.length,
      commandDiagnostics,
      durationMs: Date.now() - startedAt,
      executionTier,
      promotionId,
      storeId,
    });
    return new NextResponse(null, { status: 204 });
  }

  logger.info("Resolved TiendaNube discount callback", {
    cartProductCount: cartProducts.length,
    commandCount: commands.length,
    commandDiagnostics,
    commands,
    durationMs: Date.now() - startedAt,
    executionTier,
    promotionId,
    storeId,
  });

  return NextResponse.json(
    {
      commands,
    },
    { status: 200 },
  );
}
