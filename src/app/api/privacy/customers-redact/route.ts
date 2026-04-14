import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { verifyAndParseWebhook } from "@/lib/tiendanube/webhook-utils";

export const runtime = "nodejs";

type CustomersRedactPayload = {
  customer?: {
    email?: string;
    id?: number | string;
  };
  orders_to_redact?: Array<number | string>;
  store_id?: number | string;
};

export async function POST(request: NextRequest) {
  const verification = await verifyAndParseWebhook<CustomersRedactPayload>(request);

  if (!verification.ok) {
    return verification.response;
  }

  const storeId = String(verification.payload.store_id ?? "");
  const customerId = verification.payload.customer?.id
    ? String(verification.payload.customer.id)
    : null;

  logger.info("Processed customers redact webhook", {
    customerId,
    orderCount: verification.payload.orders_to_redact?.length ?? 0,
    storeId,
  });

  return NextResponse.json(
    {
      ok: true,
      stored_customer_data: false,
    },
    { status: 200 },
  );
}
