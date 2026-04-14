import { TiendaNubeClient } from "@/lib/tiendanube/client";
import { type LocalizedText, type TiendaNubeProduct } from "@/lib/tiendanube/types";
import { getActiveStoreOrThrow } from "@/services/store-service";

export type StoreCatalogPreviewItem = {
  createdAt: string | null;
  handle: string | null;
  id: number;
  name: string;
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
    fields: "id,name,handle,published,created_at",
    per_page: limit,
    published: true,
    sort_by: "created-at-descending",
  });

  return products.map((product) => ({
    createdAt: product.created_at ?? null,
    handle: pickLocalizedValue(product.handle) || null,
    id: product.id,
    name: pickLocalizedValue(product.name),
  }));
};
