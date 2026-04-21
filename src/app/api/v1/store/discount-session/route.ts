import { NextRequest, NextResponse } from "next/server";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { verifyRecommendationDiscountProof } from "@/lib/security";
import { getActiveStoreOrThrow } from "@/services/store-service";
import { ensureStoreDiscountIntegration } from "@/services/tiendanube-discount-integration-service";
import {
  createOfferSession,
  type VortexDiscountSource,
  invalidateOfferSessionsByTrigger,
  updateOfferSessionStatus,
  upsertDiscountRule,
} from "@/services/vortex-discount-service";

export const runtime = "nodejs";

const defaultHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

const ALLOWED_DISCOUNT_VALUES = new Set([10, 20, 30, 40, 50]);

type PrepareDiscountRequestBody = {
  cart_product_ids?: Array<number | string>;
  discount_percentage?: number;
  proof?: string;
  reward_product_id?: number | string;
  selected_variant_id?: number | string | null;
  store_id?: number | string;
  trigger_product_id?: number | string;
};

const normalizeNumericId = (value: number | string | null | undefined): number | null => {
  const normalized = Number(value);

  return Number.isFinite(normalized) ? normalized : null;
};

const normalizeNumericIdList = (values: Array<number | string> | undefined): number[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  return [...new Set(values.map((value) => Number(value)).filter(Number.isFinite))];
};

const mapStrategyToSource = (strategy: string): VortexDiscountSource => {
  if (strategy === "comprados-juntos") {
    return "fbt";
  }

  if (strategy === "seleccion-manual") {
    return "manual";
  }

  return "ia";
};

const buildRuleId = (
  storeId: string,
  source: VortexDiscountSource,
  triggerProductId: number,
  rewardProductId: number,
  discountPercentage: number,
): string => {
  return [
    "vortex",
    storeId,
    source,
    `trigger-${triggerProductId}`,
    `reward-${rewardProductId}`,
    `discount-${discountPercentage}`,
  ].join("-");
};

const buildRemoteDiscountName = (
  storeId: string,
  source: VortexDiscountSource,
  triggerProductId: number,
  rewardProductId: number,
  discountPercentage: number,
): string => {
  return [
    "Vortex",
    storeId,
    source.toUpperCase(),
    `T${triggerProductId}`,
    `R${rewardProductId}`,
    `${discountPercentage}OFF`,
  ].join("|");
};

export function OPTIONS() {
  return new NextResponse(null, {
    headers: defaultHeaders,
    status: 204,
  });
}

export async function POST(request: NextRequest) {
  let body: PrepareDiscountRequestBody;

  try {
    body = (await request.json()) as PrepareDiscountRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "No pudimos interpretar la solicitud de descuento.",
      },
      {
        headers: defaultHeaders,
        status: 400,
      },
    );
  }

  const storeId = String(body.store_id ?? "").trim();
  const proof = String(body.proof ?? "").trim();
  const triggerProductId = normalizeNumericId(body.trigger_product_id);
  const rewardProductId = normalizeNumericId(body.reward_product_id);
  const selectedVariantId = normalizeNumericId(body.selected_variant_id);
  const discountPercentage = Number(body.discount_percentage);
  const cartProductIds = normalizeNumericIdList(body.cart_product_ids);

  if (!storeId || !proof || !triggerProductId || !rewardProductId) {
    return NextResponse.json(
      {
        error: "missing_discount_context",
        message: "Faltan datos para preparar el descuento real.",
      },
      {
        headers: defaultHeaders,
        status: 400,
      },
    );
  }

  if (!ALLOWED_DISCOUNT_VALUES.has(discountPercentage)) {
    return NextResponse.json(
      {
        error: "invalid_discount_percentage",
        message: "El descuento solicitado no es valido para Vortex.",
      },
      {
        headers: defaultHeaders,
        status: 400,
      },
    );
  }

  try {
    const verifiedProof = await verifyRecommendationDiscountProof(
      proof,
      getTiendaNubeConfig().clientSecret,
    );

    if (!verifiedProof) {
      return NextResponse.json(
        {
          error: "invalid_discount_proof",
          message: "La firma del descuento no es valida o ya expiro.",
        },
        {
          headers: defaultHeaders,
          status: 401,
        },
      );
    }

    if (verifiedProof.storeId !== storeId) {
      return NextResponse.json(
        {
          error: "discount_store_mismatch",
          message: "La tienda del descuento no coincide con la sesion actual.",
        },
        {
          headers: defaultHeaders,
          status: 401,
        },
      );
    }

    if (String(verifiedProof.triggerProductId ?? "") !== String(triggerProductId)) {
      return NextResponse.json(
        {
          error: "discount_trigger_mismatch",
          message: "El trigger del descuento no coincide con el producto semilla.",
        },
        {
          headers: defaultHeaders,
          status: 401,
        },
      );
    }

    if (!verifiedProof.recommendationProductIds.includes(rewardProductId)) {
      return NextResponse.json(
        {
          error: "discount_reward_mismatch",
          message: "El reward solicitado no forma parte del set firmado por Vortex.",
        },
        {
          headers: defaultHeaders,
          status: 401,
        },
      );
    }

    if (
      cartProductIds.length > 0 &&
      !cartProductIds.includes(triggerProductId)
    ) {
      return NextResponse.json(
        {
          reason: "trigger_removed",
          status: "skipped",
        },
        {
          headers: defaultHeaders,
          status: 200,
        },
      );
    }

    const store = await getActiveStoreOrThrow(storeId);
    await ensureStoreDiscountIntegration(store);
    const source = mapStrategyToSource(verifiedProof.strategy);
    const ruleId = buildRuleId(
      storeId,
      source,
      triggerProductId,
      rewardProductId,
      discountPercentage,
    );
    const remoteDiscountName = buildRemoteDiscountName(
      storeId,
      source,
      triggerProductId,
      rewardProductId,
      discountPercentage,
    );

    const rule = await upsertDiscountRule({
      discountValue: discountPercentage,
      id: ruleId,
      name: remoteDiscountName,
      priority: 100,
      rewardProductIds: [rewardProductId],
      source,
      status: "ACTIVE",
      storeId,
      triggerProductIds: [triggerProductId],
    });

    await invalidateOfferSessionsByTrigger(storeId, triggerProductId);

    const offerSession = await createOfferSession({
      attributionId: remoteDiscountName,
      discountRuleId: rule.id,
      discountValue: discountPercentage,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      rewardProductId,
      selectedVariantId,
      storeId,
      triggerProductId,
    });

    const appliedSession = await updateOfferSessionStatus({
      appliedAt: new Date(),
      id: offerSession.id,
      status: "APPLIED",
    });

    if (!appliedSession) {
      throw new Error("offer_session_not_found_after_apply");
    }

    return NextResponse.json(
      {
        discount_rule_id: rule.id,
        offer_session_id: appliedSession.id,
        status: "ok",
      },
      {
        headers: defaultHeaders,
        status: 200,
      },
    );
  } catch (error) {
    logger.error("Unable to prepare real discount session", {
      discountPercentage,
      error,
      rewardProductId,
      storeId,
      triggerProductId,
    });

    return NextResponse.json(
      {
        error: "discount_session_failed",
        message: "No pudimos preparar el descuento real para esta recomendacion.",
      },
      {
        headers: defaultHeaders,
        status: 500,
      },
    );
  }
}
