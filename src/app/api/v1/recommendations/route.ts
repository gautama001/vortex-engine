import { NextRequest, NextResponse } from "next/server";

import { buildStorefrontCorsHeaders } from "@/lib/cors";
import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { buildRecommendationDiscountProof } from "@/lib/security";
import { getRecommendations } from "@/services/recommendation-service";

export const runtime = "nodejs";

const buildHeaders = (request: Request) =>
  buildStorefrontCorsHeaders(request, {
    allowMethods: "GET, OPTIONS",
    cacheControl: "s-maxage=60, stale-while-revalidate=300",
    contentType: "application/json; charset=utf-8",
  });

export function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: buildHeaders(request),
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
        headers: buildHeaders(request),
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
        headers: buildHeaders(request),
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
    const recommendationProductIds = result.products.map((item) => item.productId);
    const discountProof = await buildRecommendationDiscountProof(
      {
        recommendationProductIds,
        storeId,
        strategy: result.strategy,
        triggerProductId: result.seedProductId,
      },
      getTiendaNubeConfig().clientSecret,
    );

    return NextResponse.json(
      {
        count: result.products.length,
        discount_proof: discountProof,
        fallback_used: result.fallbackUsed,
        product_id: result.seedProductId,
        recommendations: result.products,
        store_id: storeId,
        strategy: result.strategy,
        widget: result.widget,
      },
      {
        headers: buildHeaders(request),
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
        headers: buildHeaders(request),
        status: 500,
      },
    );
  }
}
