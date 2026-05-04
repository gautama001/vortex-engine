import { StoreStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { verifyHmacHex } from "@/lib/security";
import { TiendaNubeClient } from "@/lib/tiendanube/client";
import { type TiendaNubeOrder, type TiendaNubeWebhookPayload } from "@/lib/tiendanube/types";
import { markOrderAttribution } from "@/services/order-attribution-service";
import {
  getStoreByTiendaNubeId,
  setStoreDiscountPromotionId,
  setStoreStatus,
} from "@/services/store-service";
import {
  listActiveOfferSessionsByStore,
  type VortexOfferSession,
  updateOfferSessionStatus,
} from "@/services/vortex-discount-service";

export const runtime = "nodejs";

const statusByEvent: Record<string, StoreStatus | null> = {
  "app/installed": StoreStatus.ACTIVE,
  "app/resumed": StoreStatus.ACTIVE,
  "app/suspended": StoreStatus.SUSPENDED,
  "app/uninstalled": StoreStatus.UNINSTALLED,
};

const isPaidOrder = (order: TiendaNubeOrder): boolean => {
  return order.payment_status === "paid" || Boolean(order.paid_at);
};

const getOrderPaidAt = (order: TiendaNubeOrder): Date => {
  if (!order.paid_at) {
    return new Date();
  }

  const paidAt = new Date(order.paid_at);

  return Number.isNaN(paidAt.getTime()) ? new Date() : paidAt;
};

const normalizeTextId = (value: number | string | null | undefined): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const normalizeQuantity = (value: number | string | null | undefined): number => {
  const normalized = typeof value === "number" ? value : Number(value ?? 1);

  if (!Number.isFinite(normalized) || normalized < 1) {
    return 1;
  }

  return Math.floor(normalized);
};

const findConvertibleSession = (
  sessions: VortexOfferSession[],
  order: TiendaNubeOrder,
): VortexOfferSession | null => {
  const lines = (order.products ?? [])
    .map((product) => ({
      productId: normalizeTextId(product.product_id ?? product.id),
      quantity: normalizeQuantity(product.quantity),
      variantId: normalizeTextId(product.variant_id),
    }))
    .filter((line) => Boolean(line.productId));

  for (const session of sessions) {
    const rewardLine = lines.find((line) => {
      if (line.productId !== session.rewardProductId) {
        return false;
      }

      return !session.selectedVariantId || line.variantId === session.selectedVariantId;
    });

    if (!rewardLine) {
      continue;
    }

    if (session.triggerProductId === session.rewardProductId) {
      if (rewardLine.quantity >= 2) {
        return session;
      }

      continue;
    }

    if (lines.some((line) => line.productId === session.triggerProductId)) {
      return session;
    }
  }

  return null;
};

const handlePaidOrderWebhook = async (payload: TiendaNubeWebhookPayload): Promise<boolean> => {
  if (!payload.id) {
    logger.warn("Skipping paid order webhook without order id", {
      event: payload.event,
      storeId: payload.store_id,
    });

    return false;
  }

  const storeId = String(payload.store_id);
  const orderId = String(payload.id);
  const store = await getStoreByTiendaNubeId(storeId);

  if (!store) {
    logger.warn("Skipping paid order webhook for unknown store", {
      orderId,
      storeId,
    });

    return false;
  }

  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId,
  });
  const order = await client.get<TiendaNubeOrder>(`/orders/${orderId}`);

  if (!isPaidOrder(order) || !Array.isArray(order.products)) {
    return false;
  }

  const offerSession = findConvertibleSession(
    await listActiveOfferSessionsByStore(storeId),
    order,
  );

  if (!offerSession) {
    return false;
  }

  const convertedAt = getOrderPaidAt(order);

  await updateOfferSessionStatus({
    convertedAt,
    id: offerSession.id,
    status: "CONVERTED",
  });
  await markOrderAttribution({
    attributedAt: convertedAt,
    orderId: order.id,
    source: offerSession.attributionId ?? "vortex_discount_session",
    storeId,
  });

  logger.info("Attributed paid order to Vortex offer session", {
    offerSessionId: offerSession.id,
    orderId: order.id,
    storeId,
  });

  return true;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-linkedstore-hmac-sha256");

  if (!signature) {
    return NextResponse.json(
      {
        error: "missing_signature",
      },
      { status: 401 },
    );
  }

  const isValid = await verifyHmacHex(getTiendaNubeConfig().clientSecret, rawBody, signature);

  if (!isValid) {
    logger.warn("Rejected webhook due to invalid HMAC signature");

    return NextResponse.json(
      {
        error: "invalid_signature",
      },
      { status: 401 },
    );
  }

  let payload: TiendaNubeWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as TiendaNubeWebhookPayload;
  } catch (error) {
    logger.warn("Webhook payload is not valid JSON", { error });
    return NextResponse.json(
      {
        error: "invalid_payload",
      },
      { status: 400 },
    );
  }

  const storeId = String(payload.store_id);
  const targetStatus = statusByEvent[payload.event] ?? null;

  if (targetStatus) {
    await setStoreStatus(storeId, targetStatus);
  }

  if (payload.event === "app/uninstalled") {
    await setStoreDiscountPromotionId(storeId, null);
  }

  let orderAttributed = false;

  if (payload.event === "order/paid") {
    try {
      orderAttributed = await handlePaidOrderWebhook(payload);
    } catch (error) {
      logger.error("Unable to attribute paid order webhook", {
        error,
        orderId: payload.id,
        storeId,
      });
    }
  }

  logger.info("Processed TiendaNube webhook", {
    event: payload.event,
    orderAttributed,
    status: targetStatus,
    storeId,
  });

  return NextResponse.json(
    {
      ok: true,
    },
    { status: 200 },
  );
}
