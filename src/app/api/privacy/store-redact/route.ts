import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { verifyAndParseWebhook } from "@/lib/tiendanube/webhook-utils";
import { deleteStoreByTiendaNubeId } from "@/services/store-service";

export const runtime = "nodejs";

type StoreRedactPayload = {
  shop_id?: number | string;
  store_id?: number | string;
};

export async function POST(request: NextRequest) {
  const verification = await verifyAndParseWebhook<StoreRedactPayload>(request);

  if (!verification.ok) {
    return verification.response;
  }

  const storeId = String(verification.payload.store_id ?? verification.payload.shop_id ?? "");

  if (!storeId) {
    return NextResponse.json(
      {
        error: "missing_store_id",
      },
      { status: 400 },
    );
  }

  const deleted = await deleteStoreByTiendaNubeId(storeId);

  logger.info("Processed store redact webhook", {
    deleted,
    storeId,
  });

  return NextResponse.json(
    {
      ok: true,
      store_id: storeId,
    },
    { status: 200 },
  );
}
