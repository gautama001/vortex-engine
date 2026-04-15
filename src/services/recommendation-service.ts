import { getDefaultRecommendationLimit } from "@/lib/env";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { clamp } from "@/lib/utils";
import { TiendaNubeClient } from "@/lib/tiendanube/client";
import {
  type LocalizedText,
  type TiendaNubeProduct,
  type TiendaNubeProductVariant,
} from "@/lib/tiendanube/types";
import { getActiveStoreOrThrow, getStoreWidgetSettings, type StoreWidgetSettings } from "@/services/store-service";

type RecommendationReason =
  | "best-seller"
  | "frequently-bought-together"
  | "manual-pick"
  | "shared-category"
  | "shared-tag";
type RecommendationStrategy =
  | "best-sellers"
  | "comprados-juntos"
  | "related-products"
  | "seleccion-manual";

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
  variantCount: number;
  variantId: number | null;
};

export type RecommendationResult = {
  fallbackUsed: boolean;
  products: RecommendationItem[];
  seedProductId: number | null;
  strategy: RecommendationStrategy;
  widget: StoreWidgetSettings;
};

type ScoredCandidate = {
  categoryMatches: number;
  product: TiendaNubeProduct;
  tagMatches: number;
};

type FBTRecommendationRow = {
  frequency: number;
  product_id: string;
  related_product_id: string;
  store_id: string;
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

const isVariantAvailable = (variant: TiendaNubeProductVariant): boolean => {
  if (!Number.isFinite(variant.id)) {
    return false;
  }

  if (variant.visible === false) {
    return false;
  }

  if (!variant.stock_management) {
    return true;
  }

  if (variant.stock === null || variant.stock === undefined) {
    return true;
  }

  return Number(variant.stock) > 0;
};

const mapProductToRecommendation = (
  product: TiendaNubeProduct,
  reason: RecommendationReason,
  score: number,
): RecommendationItem => {
  const normalizedVariants = (product.variants ?? []).filter((variant) => Number.isFinite(variant.id));
  const availableVariants = normalizedVariants.filter(isVariantAvailable);
  const directVariant = availableVariants.length === 1 ? availableVariants[0] : null;
  const pricingVariant = directVariant ?? availableVariants[0] ?? normalizedVariants[0] ?? null;
  const effectivePrice =
    parsePrice(pricingVariant?.promotional_price) ?? parsePrice(pricingVariant?.price) ?? null;

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
    variantCount: availableVariants.length > 0 ? availableVariants.length : normalizedVariants.length,
    variantId: directVariant?.id ?? null,
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

const fetchProductsByIds = async (
  client: TiendaNubeClient,
  productIds: number[],
): Promise<TiendaNubeProduct[]> => {
  const uniqueIds = [...new Set(productIds.filter(Number.isFinite))];

  if (uniqueIds.length === 0) {
    return [];
  }

  const products = await Promise.all(
    uniqueIds.map(async (productId) => {
      try {
        return await client.get<TiendaNubeProduct>(`/products/${productId}`, {
          fields: "id,name,handle,tags,categories,images,variants,published",
        });
      } catch (error) {
        logger.warn("Unable to fetch recommendation product by id", {
          error,
          productId,
        });

        return null;
      }
    }),
  );

  return products.filter(
    (product): product is TiendaNubeProduct => Boolean(product && product.published),
  );
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

const fetchFBTRecommendations = async (
  storeId: string,
  seedProductId: number,
  limit: number,
  client: TiendaNubeClient,
): Promise<RecommendationItem[]> => {
  const rows = await prisma.$queryRaw<FBTRecommendationRow[]>`
    SELECT
      store_id,
      product_id,
      related_product_id,
      frequency
    FROM "fbt_recommendations"
    WHERE "store_id" = ${storeId}
      AND "product_id" = ${String(seedProductId)}
      AND "frequency" > 2
    ORDER BY "frequency" DESC, "updated_at" DESC
    LIMIT ${limit}
  `;
  const frequencyByProductId = new Map<number, number>(
    rows
      .map((row) => [Number(row.related_product_id), row.frequency] as const)
      .filter(([productId]) => Number.isFinite(productId)),
  );
  const products = await fetchProductsByIds(client, [...frequencyByProductId.keys()]);

  return products
    .sort((left, right) => {
      return (frequencyByProductId.get(right.id) ?? 0) - (frequencyByProductId.get(left.id) ?? 0);
    })
    .slice(0, limit)
    .map((product) =>
      mapProductToRecommendation(
        product,
        "frequently-bought-together",
        frequencyByProductId.get(product.id) ?? 1,
      ),
    );
};

const fetchManualRecommendations = async (
  client: TiendaNubeClient,
  productIds: number[],
  limit: number,
  excludedProductIds: number[],
): Promise<RecommendationItem[]> => {
  const filteredIds = productIds
    .filter((productId) => Number.isFinite(productId) && !excludedProductIds.includes(productId))
    .slice(0, limit);
  const products = await fetchProductsByIds(client, filteredIds);
  const indexByProductId = new Map<number, number>(
    filteredIds.map((productId, index) => [productId, index] as const),
  );

  return products
    .sort((left, right) => (indexByProductId.get(left.id) ?? 0) - (indexByProductId.get(right.id) ?? 0))
    .map((product, index) => mapProductToRecommendation(product, "manual-pick", limit - index));
};

export const getRecommendations = async (input: {
  limit?: number;
  productId?: number | null;
  storeId: string;
}): Promise<RecommendationResult> => {
  const store = await getActiveStoreOrThrow(input.storeId);
  const limit = clamp(input.limit ?? store.recommendationLimit ?? getDefaultRecommendationLimit(), 1, 8);
  const widget = getStoreWidgetSettings(store);
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
      widget,
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
      widget,
    };
  }

  if (widget.recommendationAlgorithm === "seleccion-manual") {
    const manualProducts = await fetchManualRecommendations(
      client,
      widget.manualRecommendationProductIds,
      limit,
      [seedProduct.id],
    );

    if (manualProducts.length >= limit) {
      return {
        fallbackUsed: false,
        products: manualProducts.slice(0, limit),
        seedProductId: seedProduct.id,
        strategy: "seleccion-manual",
        widget,
      };
    }

    const bestSellerProducts = await fetchBestSellers(
      client,
      limit,
      [seedProduct.id, ...manualProducts.map((product) => product.productId)],
    );

    return {
      fallbackUsed: manualProducts.length < limit,
      products: [...manualProducts, ...bestSellerProducts].slice(0, limit),
      seedProductId: seedProduct.id,
      strategy: manualProducts.length > 0 ? "seleccion-manual" : "best-sellers",
      widget,
    };
  }

  if (widget.recommendationAlgorithm === "comprados-juntos") {
    const fbtProducts = await fetchFBTRecommendations(input.storeId, seedProduct.id, limit, client);

    if (fbtProducts.length >= limit) {
      return {
        fallbackUsed: false,
        products: fbtProducts.slice(0, limit),
        seedProductId: seedProduct.id,
        strategy: "comprados-juntos",
        widget,
      };
    }

    const bestSellerProducts = await fetchBestSellers(
      client,
      limit,
      [seedProduct.id, ...fbtProducts.map((product) => product.productId)],
    );

    return {
      fallbackUsed: true,
      products: [...fbtProducts, ...bestSellerProducts].slice(0, limit),
      seedProductId: seedProduct.id,
      strategy: fbtProducts.length > 0 ? "comprados-juntos" : "best-sellers",
      widget,
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
      widget,
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
    widget,
  };
};
