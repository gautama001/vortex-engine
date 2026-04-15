import { TiendaNubeClient } from "@/lib/tiendanube/client";
import {
  type LocalizedText,
  type TiendaNubeProduct,
  type TiendaNubeProductImage,
  type TiendaNubeProductVariant,
} from "@/lib/tiendanube/types";
import { getActiveStoreOrThrow } from "@/services/store-service";

export type StoreProductCommerceOption = {
  name: string;
  values: string[];
};

export type StoreProductCommerceVariant = {
  available: boolean;
  compareAtPrice: number | null;
  id: number;
  imageUrl: string | null;
  label: string;
  price: number | null;
  values: string[];
};

export type StoreProductCommerceSnapshot = {
  handle: string | null;
  imageUrl: string | null;
  name: string;
  options: StoreProductCommerceOption[];
  productId: number;
  variants: StoreProductCommerceVariant[];
};

const PRODUCT_FIELDS = "id,name,handle,published,images,attributes";
const PRODUCT_VARIANT_FIELDS =
  "id,image_id,price,promotional_price,stock,stock_management,values,visible";

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

const buildImageUrlMap = (images?: TiendaNubeProductImage[]): Map<number, string> => {
  return new Map(
    (images ?? [])
      .filter((image) => Number.isFinite(image.id) && typeof image.src === "string" && image.src)
      .map((image) => [image.id, image.src] as const),
  );
};

const resolveVariantValues = (variant: TiendaNubeProductVariant): string[] => {
  return (variant.values ?? [])
    .map((value) => pickLocalizedValue(value).trim())
    .filter(Boolean);
};

const isVariantAvailable = (variant: TiendaNubeProductVariant): boolean => {
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

const mapVariantToCommerce = (
  variant: TiendaNubeProductVariant,
  imageUrlById: Map<number, string>,
): StoreProductCommerceVariant | null => {
  if (!Number.isFinite(variant.id)) {
    return null;
  }

  const values = resolveVariantValues(variant);

  return {
    available: isVariantAvailable(variant),
    compareAtPrice: parsePrice(variant.price),
    id: variant.id,
    imageUrl:
      (variant.image_id && imageUrlById.get(variant.image_id)) ||
      imageUrlById.values().next().value ||
      null,
    label: values.join(" / ") || `Variante #${variant.id}`,
    price: parsePrice(variant.promotional_price) ?? parsePrice(variant.price),
    values,
  };
};

const buildVariantOptions = (
  attributes: LocalizedText[] | undefined,
  variants: StoreProductCommerceVariant[],
): StoreProductCommerceOption[] => {
  const maxDepth = variants.reduce((highestValue, variant) => {
    return Math.max(highestValue, variant.values.length);
  }, 0);
  const attributeLabels = attributes?.map((attribute) => pickLocalizedValue(attribute).trim()) ?? [];

  return Array.from({ length: maxDepth }, (_, index) => {
    const values = [
      ...new Set(
        variants
          .map((variant) => variant.values[index])
          .filter((value): value is string => Boolean(value)),
      ),
    ];

    return {
      name: attributeLabels[index] || `Opcion ${index + 1}`,
      values,
    };
  }).filter((option) => option.values.length > 0);
};

export const getStoreProductCommerceSnapshot = async (
  storeId: string,
  productId: number,
): Promise<StoreProductCommerceSnapshot> => {
  const store = await getActiveStoreOrThrow(storeId);
  const client = new TiendaNubeClient({
    accessToken: store.accessToken,
    storeId,
  });
  const [product, variants] = await Promise.all([
    client.get<TiendaNubeProduct>(`/products/${productId}`, {
      fields: PRODUCT_FIELDS,
    }),
    client.get<TiendaNubeProductVariant[]>(`/products/${productId}/variants`, {
      fields: PRODUCT_VARIANT_FIELDS,
      page: 1,
      per_page: 200,
    }),
  ]);
  const imageUrlById = buildImageUrlMap(product.images);
  const normalizedVariants = variants
    .map((variant) => mapVariantToCommerce(variant, imageUrlById))
    .filter((variant): variant is StoreProductCommerceVariant => Boolean(variant));

  return {
    handle: pickLocalizedValue(product.handle) || null,
    imageUrl: product.images?.[0]?.src ?? null,
    name: pickLocalizedValue(product.name),
    options: buildVariantOptions(product.attributes, normalizedVariants),
    productId: product.id,
    variants: normalizedVariants,
  };
};
