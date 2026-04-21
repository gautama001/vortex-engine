import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import {
  type TiendaNubeDiscountCallbackPayloadBody,
  type TiendaNubeDiscountCommand,
} from "@/lib/tiendanube/types";
import { getStoreByTiendaNubeId } from "@/services/store-service";
import { listActiveOfferSessionsByStore } from "@/services/vortex-discount-service";

export const runtime = "nodejs";

const buildDisplayText = (storeId: string): Record<string, string> => {
  const label = `Vortex discounts for store ${storeId}`;

  return {
    en: label,
    es: label,
    "es-ar": label,
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
  const cartProducts = Array.isArray(payload.products) ? payload.products : [];

  if (payload.execution_tier !== "line_item") {
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

  const store = await getStoreByTiendaNubeId(storeId);

  if (!store) {
    return NextResponse.json(
      {
        error: "store_not_found",
      },
      { status: 404 },
    );
  }

  if (store.status === "UNINSTALLED") {
    return NextResponse.json(
      {
        error: "store_uninstalled",
      },
      { status: 310 },
    );
  }

  if (!store.discountPromotionId) {
    return new NextResponse(null, { status: 204 });
  }

  const activeSessions = await listActiveOfferSessionsByStore(storeId);
  const commands: TiendaNubeDiscountCommand[] = [];
  const promotionIsActive = payload.promotions?.some(
    (promotion) => String(promotion.id) === store.discountPromotionId,
  );

  for (const session of activeSessions) {
    const triggerPresent = cartProducts.some(
      (product) => String(product.product_id ?? product.id ?? "") === session.triggerProductId,
    );
    const rewardItems = cartProducts.filter(
      (product) => String(product.product_id ?? product.id ?? "") === session.rewardProductId,
    );

    if (!triggerPresent || rewardItems.length === 0) {
      if (promotionIsActive && rewardItems.length > 0) {
        commands.push({
          command: "remove_discount",
          specs: {
            line_items: rewardItems
              .map((item) => String(item.id ?? ""))
              .filter(Boolean),
            promotion_id: store.discountPromotionId,
            scope: "line_item",
          },
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
          display_text: buildDisplayText(storeId),
          line_items: lineItems,
          promotion_id: store.discountPromotionId,
        },
      });
    }
  }

  if (commands.length === 0) {
    logger.info("No discount actions required for TiendaNube callback", {
      durationMs: Date.now() - startedAt,
      executionTier: payload.execution_tier,
      storeId,
    });
    return new NextResponse(null, { status: 204 });
  }

  logger.info("Resolved TiendaNube discount callback", {
    commandCount: commands.length,
    durationMs: Date.now() - startedAt,
    executionTier: payload.execution_tier,
    storeId,
  });

  return NextResponse.json(
    {
      commands,
    },
    { status: 200 },
  );
}
