import { TiendaNubeClient } from "@/lib/tiendanube/client";
import { type LocalizedText, type TiendaNubeStore } from "@/lib/tiendanube/types";
import { getActiveStoreOrThrow } from "@/services/store-service";

export type StorefrontContext = {
  currencyCode: string | null;
  name: string;
  primaryDomain: string | null;
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

export const getStorefrontContext = async (
  tiendanubeId: string,
): Promise<StorefrontContext | null> => {
  const store = await getActiveStoreOrThrow(tiendanubeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId: tiendanubeId,
  });
  const storefront = await client.get<TiendaNubeStore>("/store", {
    fields: "name,original_domain,domains,main_currency",
  });
  const primaryDomain =
    storefront.original_domain ||
    storefront.domains?.find((domain) => Boolean(domain)) ||
    null;

  return {
    currencyCode: storefront.main_currency ?? null,
    name: pickLocalizedValue(storefront.name) || `Store #${tiendanubeId}`,
    primaryDomain: primaryDomain ? `https://${primaryDomain.replace(/^https?:\/\//, "")}` : null,
  };
};
