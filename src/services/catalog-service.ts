import { TiendaNubeClient } from "@/lib/tiendanube/client";
import { type LocalizedText, type TiendaNubeProduct } from "@/lib/tiendanube/types";
import { getActiveStoreOrThrow } from "@/services/store-service";

export type StoreCatalogPreviewItem = {
  createdAt: string | null;
  handle: string | null;
  id: number;
  imageUrl: string | null;
  name: string;
  price: number | null;
};

export type StoreCatalogPreviewPage = {
  hasMore: boolean;
  page: number;
  products: StoreCatalogPreviewItem[];
};

const DEFAULT_CATALOG_PAGE_SIZE = 8;
const MAX_CATALOG_PAGE_SIZE = 24;
const CATALOG_PREVIEW_FIELDS = "id,name,handle,published,created_at,images,variants";

const mapProductToCatalogPreview = (product: TiendaNubeProduct): StoreCatalogPreviewItem => {
  const primaryVariant = product.variants?.find((variant) => Boolean(variant.id)) ?? null;

  return {
    createdAt: product.created_at ?? null,
    handle: pickLocalizedValue(product.handle) || null,
    id: product.id,
    imageUrl: product.images?.[0]?.src ?? null,
    name: pickLocalizedValue(product.name),
    price:
      parsePrice(primaryVariant?.promotional_price) ?? parsePrice(primaryVariant?.price) ?? null,
  };
};

const parsePrice = (value?: number | string | null): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
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

const clampCatalogLimit = (limit?: number): number => {
  const parsedLimit = Number(limit ?? DEFAULT_CATALOG_PAGE_SIZE);

  if (!Number.isFinite(parsedLimit)) {
    return DEFAULT_CATALOG_PAGE_SIZE;
  }

  return Math.max(1, Math.min(parsedLimit, MAX_CATALOG_PAGE_SIZE));
};

const normalizePage = (page?: number): number => {
  const parsedPage = Number(page ?? 1);

  if (!Number.isFinite(parsedPage)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsedPage));
};

const buildCatalogPreviewPage = async (input: {
  client: TiendaNubeClient;
  limit?: number;
  page?: number;
  query?: string;
}): Promise<StoreCatalogPreviewPage> => {
  const limit = clampCatalogLimit(input.limit);
  const page = normalizePage(input.page);
  const query = input.query?.trim() ?? "";
  const products = await input.client.get<TiendaNubeProduct[]>("/products", {
    fields: CATALOG_PREVIEW_FIELDS,
    page,
    per_page: limit,
    published: true,
    q: query || undefined,
    sort_by: "created-at-descending",
  });

  return {
    hasMore: products.length === limit,
    page,
    products: products.map(mapProductToCatalogPreview),
  };
};

const buildCatalogPreviewByIds = async (input: {
  client: TiendaNubeClient;
  productIds: number[];
}): Promise<StoreCatalogPreviewItem[]> => {
  const uniqueIds = [...new Set(input.productIds.filter(Number.isFinite))];

  if (uniqueIds.length === 0) {
    return [];
  }

  const products = await Promise.all(
    uniqueIds.map(async (productId) => {
      try {
        return await input.client.get<TiendaNubeProduct>(`/products/${productId}`, {
          fields: CATALOG_PREVIEW_FIELDS,
        });
      } catch {
        return null;
      }
    }),
  );

  const orderedProducts = uniqueIds
    .map((productId) =>
      products.find((product) => product?.id === productId && product.published),
    )
    .filter((product): product is TiendaNubeProduct => Boolean(product));

  return orderedProducts.map(mapProductToCatalogPreview);
};

export const listCatalogPreview = async (
  tiendanubeId: string,
  limit = DEFAULT_CATALOG_PAGE_SIZE,
): Promise<StoreCatalogPreviewItem[]> => {
  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });
  const result = await buildCatalogPreviewPage({
    client,
    limit,
    page: 1,
  });

  return result.products;
};

export const searchCatalogPreview = async (
  tiendanubeId: string,
  query: string,
  limit = DEFAULT_CATALOG_PAGE_SIZE,
): Promise<StoreCatalogPreviewItem[]> => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return listCatalogPreview(tiendanubeId, limit);
  }

  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });
  const result = await buildCatalogPreviewPage({
    client,
    limit,
    page: 1,
    query: normalizedQuery,
  });

  return result.products;
};

export const listCatalogPreviewPage = async (
  tiendanubeId: string,
  options?: {
    limit?: number;
    page?: number;
  },
): Promise<StoreCatalogPreviewPage> => {
  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });

  return buildCatalogPreviewPage({
    client,
    limit: options?.limit,
    page: options?.page,
  });
};

export const searchCatalogPreviewPage = async (
  tiendanubeId: string,
  query: string,
  options?: {
    limit?: number;
    page?: number;
  },
): Promise<StoreCatalogPreviewPage> => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return listCatalogPreviewPage(tiendanubeId, options);
  }

  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });

  return buildCatalogPreviewPage({
    client,
    limit: options?.limit,
    page: options?.page,
    query: normalizedQuery,
  });
};

export const getCatalogPreviewByIds = async (
  tiendanubeId: string,
  productIds: number[],
): Promise<StoreCatalogPreviewItem[]> => {
  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });

  return buildCatalogPreviewByIds({
    client,
    productIds,
  });
};
