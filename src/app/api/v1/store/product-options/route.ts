import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getStoreProductCommerceSnapshot } from "@/services/product-commerce-service";

export const runtime = "nodejs";

const defaultHeaders = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
  "Content-Type": "application/json; charset=utf-8",
};

export function OPTIONS() {
  return new NextResponse(null, {
    headers: defaultHeaders,
    status: 204,
  });
}

export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get("store_id");
  const productIdParam = request.nextUrl.searchParams.get("product_id");
  const parsedProductId = productIdParam ? Number(productIdParam) : null;

  if (!storeId) {
    return NextResponse.json(
      {
        error: "missing_store_id",
        message: "store_id is required",
      },
      {
        headers: defaultHeaders,
        status: 400,
      },
    );
  }

  if (!productIdParam || !Number.isFinite(parsedProductId)) {
    return NextResponse.json(
      {
        error: "invalid_product_id",
        message: "product_id must be numeric",
      },
      {
        headers: defaultHeaders,
        status: 400,
      },
    );
  }

  try {
    const productId = parsedProductId as number;
    const snapshot = await getStoreProductCommerceSnapshot(storeId, productId);

    return NextResponse.json(
      {
        product: snapshot,
        status: "ok",
        store_id: storeId,
      },
      {
        headers: defaultHeaders,
        status: 200,
      },
    );
  } catch (error) {
    logger.error("Store product commerce lookup failed", {
      error,
      productId: parsedProductId,
      storeId,
    });

    return NextResponse.json(
      {
        error: "store_product_commerce_lookup_failed",
        message: "Unable to load product options for the current store",
      },
      {
        headers: defaultHeaders,
        status: 500,
      },
    );
  }
}
