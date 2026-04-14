import { getDefaultRecommendationLimit } from "@/lib/env";
import { logger } from "@/lib/logger";
import { clamp } from "@/lib/utils";
import { TiendaNubeClient } from "@/lib/tiendanube/client";
import { type LocalizedText, type TiendaNubeProduct } from "@/lib/tiendanube/types";
import { getActiveStoreOrThrow } from "@/services/store-service";

type RecommendationReason = "best-seller" | "shared-category" | "shared-tag";
type RecommendationStrategy = "best-sellers" | "related-products";

type RecommendationItem = {
  categoryIds: number[];
  handle: string | null;
  imageUrl: string | null;
  name: string;
  price: number | null;
  productId: number;
  reason: RecommendationReason;
  score: number;
  tags: string[];
  variantId: number | null;
};

export type RecommendationResult = {
  fallbackUsed: boolean;
  products: RecommendationItem[];
  seedProductId: number | null;
  strategy: RecommendationStrategy;
};

type ScoredCandidate = {
  categoryMatches: number;
  product: TiendaNubeProduct;
  tagMatches: number;
};

const pickLocalizedValue = (value?: LocalizedText): string => {
  if (!value) {
    return "";
  }

  const priorityLocales = ["es_AR", "es", "pt_BR", "pt", "en"];

  for (const locale of priorityLocales) {
    const localizedValue = value[locale];

    if (localizedValue) {
      return localizedValue;
    }
  }

  return Object.values(value).find(Boolean) ?? "";
};

const normalizeTags = (tags?: string | string[] | null): string[] => {
  const normalizedTags = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",") : [];

  return [...new Set(normalizedTags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
};

const extractCategoryIds = (product: TiendaNubeProduct): number[] => {
  const categoryReferences = product.categories ?? [];

  return [
    ...new Set(
      categoryReferences
        .map((categoryReference) =>
          typeof categoryReference === "number" ? categoryReference : categoryReference.id,
        )
        .filter((categoryId): categoryId is number => Number.isFinite(categoryId)),
    ),
  ];
};

const parsePrice = (value?: number | string | null): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const mapProductToRecommendation = (
  product: TiendaNubeProduct,
  reason: RecommendationReason,
  score: number,
): RecommendationItem => {
  const primaryVariant = product.variants?.find((variant) => Boolean(variant.id)) ?? null;
  const effectivePrice =
    parsePrice(primaryVariant?.promotional_price) ?? parsePrice(primaryVariant?.price) ?? null;

  return {
    categoryIds: extractCategoryIds(product),
    handle: pickLocalizedValue(product.handle) || null,
    imageUrl: product.images?.[0]?.src ?? null,
    name: pickLocalizedValue(product.name),
    price: effectivePrice,
    productId: product.id,
    reason,
    score,
    tags: normalizeTags(product.tags),
    variantId: primaryVariant?.id ?? null,
  };
};

const scoreReason = (candidate: ScoredCandidate): RecommendationReason => {
  if (candidate.categoryMatches > 0) {
    return "shared-category";
  }

  if (candidate.tagMatches > 0) {
    return "shared-tag";
  }

  return "best-seller";
};

const candidateScore = (candidate: ScoredCandidate): number => {
  return candidate.categoryMatches * 4 + candidate.tagMatches * 2;
};

const fetchSeedProduct = async (
  client: TiendaNubeClient,
  productId: number,
): Promise<TiendaNubeProduct | null> => {
  try {
    return await client.get<TiendaNubeProduct>(`/products/${productId}`, {
      fields: "id,name,handle,tags,categories,images,variants,published",
    });
  } catch (error) {
    logger.warn("Unable to fetch seed product for recommendations", {
      error,
      productId,
    });

    return null;
  }
};

const fetchProducts = async (
  client: TiendaNubeClient,
  query: Record<string, boolean | number | string>,
): Promise<TiendaNubeProduct[]> => {
  return client.get<TiendaNubeProduct[]>("/products", {
    fields: "id,name,handle,tags,categories,images,variants,published",
    per_page: 20,
    published: true,
    ...query,
  });
};

const fetchRelatedCandidates = async (
  client: TiendaNubeClient,
  seedProduct: TiendaNubeProduct,
): Promise<RecommendationItem[]> => {
  const seedTags = normalizeTags(seedProduct.tags).slice(0, 3);
  const seedCategoryIds = extractCategoryIds(seedProduct).slice(0, 2);
  const requests: Promise<TiendaNubeProduct[]>[] = [];

  for (const tag of seedTags) {
    requests.push(fetchProducts(client, { q: tag }));
  }

  for (const categoryId of seedCategoryIds) {
    requests.push(fetchProducts(client, { category_id: categoryId }));
  }

  if (requests.length === 0) {
    return [];
  }

  const results = await Promise.all(requests);
  const candidateMap = new Map<number, ScoredCandidate>();

  for (const product of results.flat()) {
    if (!product.published || product.id === seedProduct.id) {
      continue;
    }

    const existingCandidate = candidateMap.get(product.id) ?? {
      categoryMatches: 0,
      product,
      tagMatches: 0,
    };
    const productTags = normalizeTags(product.tags);
    const productCategoryIds = extractCategoryIds(product);

    existingCandidate.categoryMatches = seedCategoryIds.filter((categoryId) =>
      productCategoryIds.includes(categoryId),
    ).length;
    existingCandidate.tagMatches = seedTags.filter((tag) => productTags.includes(tag)).length;
    existingCandidate.product = product;
    candidateMap.set(product.id, existingCandidate);
  }

  return [...candidateMap.values()]
    .filter((candidate) => candidate.categoryMatches > 0 || candidate.tagMatches > 0)
    .sort((left, right) => {
      const scoreDelta = candidateScore(right) - candidateScore(left);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return left.product.id - right.product.id;
    })
    .map((candidate) =>
      mapProductToRecommendation(candidate.product, scoreReason(candidate), candidateScore(candidate)),
    );
};

const fetchBestSellers = async (
  client: TiendaNubeClient,
  limit: number,
  excludedProductIds: number[],
): Promise<RecommendationItem[]> => {
  const products = await client.get<TiendaNubeProduct[]>("/products", {
    fields: "id,name,handle,tags,categories,images,variants,published",
    per_page: Math.max(limit * 2, 8),
    published: true,
    sort_by: "best-selling",
  });

  return products
    .filter((product) => product.published && !excludedProductIds.includes(product.id))
    .slice(0, limit)
    .map((product) => mapProductToRecommendation(product, "best-seller", 1));
};

export const getRecommendations = async (input: {
  limit?: number;
  productId?: number | null;
  storeId: string;
}): Promise<RecommendationResult> => {
  const limit = clamp(input.limit ?? getDefaultRecommendationLimit(), 1, 8);
  const store = await getActiveStoreOrThrow(input.storeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: input.storeId,
  });

  if (!input.productId) {
    const products = await fetchBestSellers(client, limit, []);

    return {
      fallbackUsed: true,
      products,
      seedProductId: null,
      strategy: "best-sellers",
    };
  }

  const seedProduct = await fetchSeedProduct(client, input.productId);

  if (!seedProduct) {
    const products = await fetchBestSellers(client, limit, []);

    return {
      fallbackUsed: true,
      products,
      seedProductId: input.productId,
      strategy: "best-sellers",
    };
  }

  const relatedProducts = await fetchRelatedCandidates(client, seedProduct);
  const selectedRelatedProducts = relatedProducts.slice(0, limit);

  if (selectedRelatedProducts.length >= limit) {
    logger.info("Resolved recommendations via related products", {
      limit,
      productId: input.productId,
      storeId: input.storeId,
    });

    return {
      fallbackUsed: false,
      products: selectedRelatedProducts,
      seedProductId: seedProduct.id,
      strategy: "related-products",
    };
  }

  const bestSellerProducts = await fetchBestSellers(
    client,
    limit,
    [seedProduct.id, ...selectedRelatedProducts.map((product) => product.productId)],
  );
  const products = [...selectedRelatedProducts, ...bestSellerProducts].slice(0, limit);

  logger.info("Resolved recommendations with fallback", {
    limit,
    productId: input.productId,
    relatedCount: selectedRelatedProducts.length,
    storeId: input.storeId,
  });

  return {
    fallbackUsed: true,
    products,
    seedProductId: seedProduct.id,
    strategy: selectedRelatedProducts.length > 0 ? "related-products" : "best-sellers",
  };
};
