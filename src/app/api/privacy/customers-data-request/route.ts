import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { verifyAndParseWebhook } from "@/lib/tiendanube/webhook-utils";

export const runtime = "nodejs";

type CustomersDataRequestPayload = {
  customer?: {
    email?: string;
    id?: number | string;
  };
  data_request?: {
    id?: number | string;
  };
  store_id?: number | string;
};

export async function POST(request: NextRequest) {
  const verification = await verifyAndParseWebhook<CustomersDataRequestPayload>(request);

  if (!verification.ok) {
    return verification.response;
  }

  const storeId = String(verification.payload.store_id ?? "");
  const customerId = verification.payload.customer?.id
    ? String(verification.payload.customer.id)
    : null;
  const requestId = verification.payload.data_request?.id
    ? String(verification.payload.data_request.id)
    : null;

  logger.info("Processed customers data request webhook", {
    customerId,
    requestId,
    storeId,
  });

  return NextResponse.json(
    {
      customer_id: customerId,
      ok: true,
      report: {
        orders: [],
        stored_customer_data: false,
      },
      store_id: storeId,
    },
    { status: 200 },
  );
}
