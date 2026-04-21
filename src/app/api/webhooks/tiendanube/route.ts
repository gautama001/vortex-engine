import { StoreStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { verifyHmacHex } from "@/lib/security";
import { type TiendaNubeWebhookPayload } from "@/lib/tiendanube/types";
import { setStoreDiscountPromotionId, setStoreStatus } from "@/services/store-service";

export const runtime = "nodejs";

const statusByEvent: Record<string, StoreStatus | null> = {
  "app/installed": StoreStatus.ACTIVE,
  "app/resumed": StoreStatus.ACTIVE,
  "app/suspended": StoreStatus.SUSPENDED,
  "app/uninstalled": StoreStatus.UNINSTALLED,
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

  logger.info("Processed TiendaNube webhook", {
    event: payload.event,
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
