import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { getRecommendations } from "@/services/recommendation-service";

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
  const limitParam = request.nextUrl.searchParams.get("limit");
  const productId = productIdParam ? Number(productIdParam) : null;
  const limit = limitParam ? Number(limitParam) : undefined;

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

  if (productIdParam && !Number.isFinite(productId)) {
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
    const result = await getRecommendations({
      limit,
      productId,
      storeId,
    });

    return NextResponse.json(
      {
        count: result.products.length,
        fallback_used: result.fallbackUsed,
        product_id: result.seedProductId,
        recommendations: result.products,
        store_id: storeId,
        strategy: result.strategy,
        widget: result.widget,
      },
      {
        headers: defaultHeaders,
        status: 200,
      },
    );
  } catch (error) {
    logger.error("Recommendation request failed", {
      error,
      productId,
      storeId,
    });

    return NextResponse.json(
      {
        error: "recommendation_resolution_failed",
        message: "Unable to resolve recommendations for this store",
      },
      {
        headers: defaultHeaders,
        status: 500,
      },
    );
  }
}
