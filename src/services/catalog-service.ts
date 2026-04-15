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

export const listCatalogPreview = async (
  tiendanubeId: string,
  limit = 6,
): Promise<StoreCatalogPreviewItem[]> => {
  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });
  const products = await client.get<TiendaNubeProduct[]>("/products", {
    fields: "id,name,handle,published,created_at,images,variants",
    per_page: limit,
    published: true,
    sort_by: "created-at-descending",
  });

  return products.map((product) => {
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
  });
};
