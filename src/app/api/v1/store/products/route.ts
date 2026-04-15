import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ADMIN_SESSION_COOKIE, verifySignedSessionValue } from "@/lib/security";
import { clamp } from "@/lib/utils";
import { listCatalogPreview, searchCatalogPreview } from "@/services/catalog-service";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "Content-Type": "application/json; charset=utf-8",
  Pragma: "no-cache",
};

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        {
          error: "missing_admin_session",
          message: "Missing signed admin session",
        },
        {
          headers: noStoreHeaders,
          status: 401,
        },
      );
    }

    const clientSecret = getTiendaNubeConfig().clientSecret;
    const verifiedSession = await verifySignedSessionValue(sessionCookie, clientSecret);

    if (!verifiedSession?.storeId) {
      return NextResponse.json(
        {
          error: "invalid_admin_session",
          message: "Admin session is invalid or expired",
        },
        {
          headers: noStoreHeaders,
          status: 401,
        },
      );
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";
    const limit = clamp(Number(url.searchParams.get("limit") ?? 24), 1, 36);
    const products = query
      ? await searchCatalogPreview(verifiedSession.storeId, query, limit)
      : await listCatalogPreview(verifiedSession.storeId, limit);

    return NextResponse.json(
      {
        products,
        status: "ok",
        storeId: verifiedSession.storeId,
      },
      {
        headers: noStoreHeaders,
        status: 200,
      },
    );
  } catch (error) {
    logger.error("Store products lookup failed", {
      error,
    });

    return NextResponse.json(
      {
        error: "store_products_lookup_failed",
        message: "Unable to load products for the current store",
      },
      {
        headers: noStoreHeaders,
        status: 500,
      },
    );
  }
}
