import { NextRequest, NextResponse } from "next/server";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { verifyHmacHex } from "@/lib/security";

type VerifiedWebhookResult<TPayload> =
  | {
      ok: false;
      response: NextResponse;
    }
  | {
      ok: true;
      payload: TPayload;
      rawBody: string;
    };

export const verifyAndParseWebhook = async <TPayload>(
  request: NextRequest,
): Promise<VerifiedWebhookResult<TPayload>> => {
  const rawBody = await request.text();
  const signature = request.headers.get("x-linkedstore-hmac-sha256");

  if (!signature) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "missing_signature",
        },
        { status: 401 },
      ),
    };
  }

  const validSignature = await verifyHmacHex(
    getTiendaNubeConfig().clientSecret,
    rawBody,
    signature,
  );

  if (!validSignature) {
    logger.warn("Rejected TiendaNube webhook due to invalid HMAC signature");

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "invalid_signature",
        },
        { status: 401 },
      ),
    };
  }

  try {
    return {
      ok: true,
      payload: JSON.parse(rawBody) as TPayload,
      rawBody,
    };
  } catch (error) {
    logger.warn("Rejected TiendaNube webhook due to invalid JSON payload", {
      error,
    });

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "invalid_payload",
        },
        { status: 400 },
      ),
    };
  }
};
