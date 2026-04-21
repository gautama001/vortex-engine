import { StoreStatus, type Store as PrismaStore } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureStorePersistence } from "@/lib/store-persistence";
import { clamp } from "@/lib/utils";
import {
  FONT_FAMILY_OPTIONS,
  type FontFamilyValue,
  type ManualRecommendationEntry,
  type StrategyValue,
} from "@/components/dashboard/types";
import type {
  DesktopColumnValue,
  DiscountPercentageValue,
  MobileColumnValue,
} from "@/components/dashboard/types";

type UpsertStoreInstallationInput = {
  accessToken: string;
  scope: string;
  status?: StoreStatus;
  tiendanubeId: string;
};

type StoreRow = {
  access_token: string;
  accent_color: string | null;
  background_color: string | null;
  border_radius: number | null;
  cart_page_enabled: boolean | null;
  created_at: Date;
  discount_promotion_id: string | null;
  hide_out_of_stock: boolean | null;
  id: string;
  manual_recommendation_product_ids: string | null;
  product_page_enabled: boolean | null;
  quick_add_label: string | null;
  recommendation_algorithm: string | null;
  recommendation_limit: number | null;
  require_image: boolean | null;
  scope: string;
  status: StoreStatus;
  tiendanube_id: string;
  updated_at: Date;
  widget_enabled: boolean | null;
  widget_subtitle: string | null;
  widget_title: string | null;
};

export type StoreRecord = Omit<PrismaStore, "manualRecommendationProductIds"> & {
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  cartPageEnabled: boolean;
  desktopColumns: DesktopColumnValue;
  discountPercentage: DiscountPercentageValue;
  discountPromotionId: string | null;
  fontColor: string;
  fontFamily: FontFamilyValue;
  hideOutOfStock: boolean;
  manualRecommendations: ManualRecommendationEntry[];
  manualRecommendationProductIds: number[];
  mobileColumns: MobileColumnValue;
  productPageEnabled: boolean;
  quickAddLabel: string;
  recommendationAlgorithm: StrategyValue;
  recommendationLimit: number;
  requireImage: boolean;
  widgetEnabled: boolean;
  widgetSubtitle: string;
  widgetTitle: string;
};

export type StoreWidgetSettings = {
  accentColor: string;
  backgroundColor: string;
  borderRadius: number;
  cartPageEnabled: boolean;
  desktopColumns: DesktopColumnValue;
  discountPercentage: DiscountPercentageValue;
  fontColor: string;
  fontFamily: FontFamilyValue;
  hideOutOfStock: boolean;
  manualRecommendations: ManualRecommendationEntry[];
  manualRecommendationProductIds: number[];
  mobileColumns: MobileColumnValue;
  productPageEnabled: boolean;
  quickAddLabel: string;
  recommendationAlgorithm: StrategyValue;
  recommendationLimit: number;
  requireImage: boolean;
  widgetEnabled: boolean;
  widgetSubtitle: string;
  widgetTitle: string;
};

export const DEFAULT_STORE_WIDGET_SETTINGS: StoreWidgetSettings = {
  accentColor: "#58E2F3",
  backgroundColor: "#0A0F1A",
  borderRadius: 24,
  cartPageEnabled: true,
  desktopColumns: 4,
  discountPercentage: 0,
  fontColor: "#E6EDF6",
  fontFamily: "plex-sans",
  hideOutOfStock: true,
  manualRecommendations: [],
  manualRecommendationProductIds: [],
  mobileColumns: 2,
  productPageEnabled: true,
  quickAddLabel: "Quick Add",
  recommendationAlgorithm: "ia-inteligente",
  recommendationLimit: 4,
  requireImage: true,
  widgetEnabled: true,
  widgetSubtitle:
    "Vortex selecciona sugerencias de alta afinidad y activa fallback de cold start para convertir.",
  widgetTitle: "Llevate algo que combine mejor con esta compra",
};

type UpdateStoreWidgetSettingsInput = Partial<StoreWidgetSettings>;

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const STRATEGY_VALUES = new Set<StrategyValue>([
  "comprados-juntos",
  "ia-inteligente",
  "seleccion-manual",
]);
const FONT_FAMILY_VALUES = new Set<FontFamilyValue>(
  FONT_FAMILY_OPTIONS.map((option) => option.valor),
);
const DISCOUNT_PERCENTAGE_VALUES = new Set<DiscountPercentageValue>([
  0,
  10,
  20,
  30,
  40,
  50,
]);
const DESKTOP_COLUMN_VALUES = new Set<DesktopColumnValue>([2, 3, 4]);
const MOBILE_COLUMN_VALUES = new Set<MobileColumnValue>([1, 2]);

const normalizeColor = (value: string | null | undefined, fallback: string): string => {
  const normalized = typeof value === "string" ? value.trim() : "";

  return HEX_COLOR_PATTERN.test(normalized) ? normalized.toUpperCase() : fallback;
};

const normalizeStrategy = (
  value: string | null | undefined,
  fallback: StrategyValue,
): StrategyValue => {
  const normalized = typeof value === "string" ? value.trim() : "";

  return STRATEGY_VALUES.has(normalized as StrategyValue)
    ? (normalized as StrategyValue)
    : fallback;
};

const normalizeFontFamily = (
  value: string | null | undefined,
  fallback: FontFamilyValue,
): FontFamilyValue => {
  const normalized = typeof value === "string" ? value.trim() : "";

  return FONT_FAMILY_VALUES.has(normalized as FontFamilyValue)
    ? (normalized as FontFamilyValue)
    : fallback;
};

const normalizeDiscountPercentage = (
  value: number | string | null | undefined,
  fallback: DiscountPercentageValue,
): DiscountPercentageValue => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  return DISCOUNT_PERCENTAGE_VALUES.has(normalized as DiscountPercentageValue)
    ? (normalized as DiscountPercentageValue)
    : fallback;
};

const normalizeDesktopColumns = (
  value: number | string | null | undefined,
  fallback: DesktopColumnValue,
): DesktopColumnValue => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  return DESKTOP_COLUMN_VALUES.has(normalized as DesktopColumnValue)
    ? (normalized as DesktopColumnValue)
    : fallback;
};

const normalizeMobileColumns = (
  value: number | string | null | undefined,
  fallback: MobileColumnValue,
): MobileColumnValue => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  return MOBILE_COLUMN_VALUES.has(normalized as MobileColumnValue)
    ? (normalized as MobileColumnValue)
    : fallback;
};

type ManualMerchandisingState = {
  desktopColumns: DesktopColumnValue;
  discountPercentage: DiscountPercentageValue;
  fontColor: string;
  fontFamily: FontFamilyValue;
  mobileColumns: MobileColumnValue;
  recommendations: ManualRecommendationEntry[];
  productIds: number[];
};

const parseProductIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => Number(item)).filter(Number.isFinite))];
};

const parseManualRecommendations = (
  value: unknown,
  fallbackDiscountPercentage: DiscountPercentageValue,
): ManualRecommendationEntry[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries = new Map<number, ManualRecommendationEntry>();

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as {
      discountPercentage?: number | string;
      productId?: number | string;
    };
    const productId = Number(candidate.productId);

    if (!Number.isFinite(productId)) {
      continue;
    }

    entries.set(productId, {
      discountPercentage: normalizeDiscountPercentage(
        candidate.discountPercentage,
        fallbackDiscountPercentage,
      ),
      productId,
    });
  }

  return [...entries.values()].slice(0, 24);
};

const parseManualMerchandisingState = (
  value: string | null | undefined,
): ManualMerchandisingState => {
  if (!value) {
    return {
      desktopColumns: DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
      discountPercentage: DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
      fontColor: DEFAULT_STORE_WIDGET_SETTINGS.fontColor,
      fontFamily: DEFAULT_STORE_WIDGET_SETTINGS.fontFamily,
      mobileColumns: DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
      recommendations: [],
      productIds: [],
    };
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return {
        desktopColumns: DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
        discountPercentage: DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
        fontColor: DEFAULT_STORE_WIDGET_SETTINGS.fontColor,
        fontFamily: DEFAULT_STORE_WIDGET_SETTINGS.fontFamily,
        mobileColumns: DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
        recommendations: [],
        productIds: parseProductIds(parsed),
      };
    }

    if (!parsed || typeof parsed !== "object") {
      return {
        desktopColumns: DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
        discountPercentage: DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
        fontColor: DEFAULT_STORE_WIDGET_SETTINGS.fontColor,
        fontFamily: DEFAULT_STORE_WIDGET_SETTINGS.fontFamily,
        mobileColumns: DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
        recommendations: [],
        productIds: [],
      };
    }

    const blob = parsed as {
      desktopColumns?: number | string;
      discountPercentage?: number | string;
      fontColor?: string;
      fontFamily?: string;
      ids?: unknown;
      mobileColumns?: number | string;
      productIds?: unknown;
      recommendations?: unknown;
    };

    const discountPercentage = normalizeDiscountPercentage(
      blob.discountPercentage,
      DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
    );
    const productIds = parseProductIds(blob.productIds ?? blob.ids);
    const recommendations = parseManualRecommendations(
      blob.recommendations,
      discountPercentage,
    );
    const fallbackRecommendations =
      recommendations.length > 0
        ? recommendations
        : productIds.map((productId) => ({
            discountPercentage,
            productId,
          }));

    return {
      desktopColumns: normalizeDesktopColumns(
        blob.desktopColumns,
        DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
      ),
      discountPercentage,
      fontColor: normalizeColor(blob.fontColor, DEFAULT_STORE_WIDGET_SETTINGS.fontColor),
      fontFamily: normalizeFontFamily(blob.fontFamily, DEFAULT_STORE_WIDGET_SETTINGS.fontFamily),
      mobileColumns: normalizeMobileColumns(
        blob.mobileColumns,
        DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
      ),
      recommendations: fallbackRecommendations,
      productIds: fallbackRecommendations.map((entry) => entry.productId),
    };
  } catch {
    return {
      desktopColumns: DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
      discountPercentage: DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
      fontColor: DEFAULT_STORE_WIDGET_SETTINGS.fontColor,
      fontFamily: DEFAULT_STORE_WIDGET_SETTINGS.fontFamily,
      mobileColumns: DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
      recommendations: [],
      productIds: [],
    };
  }
};

const serializeManualMerchandisingState = (value: ManualMerchandisingState): string => {
  return JSON.stringify({
    desktopColumns: normalizeDesktopColumns(
      value.desktopColumns,
      DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
    ),
    discountPercentage: normalizeDiscountPercentage(
      value.discountPercentage,
      DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
    ),
    fontColor: normalizeColor(value.fontColor, DEFAULT_STORE_WIDGET_SETTINGS.fontColor),
    fontFamily: normalizeFontFamily(value.fontFamily, DEFAULT_STORE_WIDGET_SETTINGS.fontFamily),
    mobileColumns: normalizeMobileColumns(
      value.mobileColumns,
      DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
    ),
    productIds: parseProductIds(value.productIds).slice(0, 24),
    recommendations: parseManualRecommendations(
      value.recommendations,
      normalizeDiscountPercentage(
        value.discountPercentage,
        DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
      ),
    ),
  });
};

const mapStoreRow = (row: StoreRow): StoreRecord => {
  const manualMerchandisingState = parseManualMerchandisingState(
    row.manual_recommendation_product_ids,
  );

  return {
    accessToken: row.access_token,
    accentColor: normalizeColor(row.accent_color, DEFAULT_STORE_WIDGET_SETTINGS.accentColor),
    backgroundColor: normalizeColor(
      row.background_color,
      DEFAULT_STORE_WIDGET_SETTINGS.backgroundColor,
    ),
    borderRadius: clamp(
      row.border_radius ?? DEFAULT_STORE_WIDGET_SETTINGS.borderRadius,
      8,
      32,
    ),
    cartPageEnabled: row.cart_page_enabled ?? DEFAULT_STORE_WIDGET_SETTINGS.cartPageEnabled,
    desktopColumns: manualMerchandisingState.desktopColumns,
    discountPercentage: manualMerchandisingState.discountPercentage,
    discountPromotionId: row.discount_promotion_id,
    createdAt: row.created_at,
    fontColor: manualMerchandisingState.fontColor,
    fontFamily: manualMerchandisingState.fontFamily,
    hideOutOfStock:
      row.hide_out_of_stock ?? DEFAULT_STORE_WIDGET_SETTINGS.hideOutOfStock,
    id: row.id,
    manualRecommendations: manualMerchandisingState.recommendations,
    manualRecommendationProductIds: manualMerchandisingState.productIds,
    mobileColumns: manualMerchandisingState.mobileColumns,
    productPageEnabled:
      row.product_page_enabled ?? DEFAULT_STORE_WIDGET_SETTINGS.productPageEnabled,
    quickAddLabel: row.quick_add_label ?? DEFAULT_STORE_WIDGET_SETTINGS.quickAddLabel,
    recommendationAlgorithm: normalizeStrategy(
      row.recommendation_algorithm,
      DEFAULT_STORE_WIDGET_SETTINGS.recommendationAlgorithm,
    ),
    recommendationLimit: clamp(
      row.recommendation_limit ?? DEFAULT_STORE_WIDGET_SETTINGS.recommendationLimit,
      1,
      8,
    ),
    requireImage: row.require_image ?? DEFAULT_STORE_WIDGET_SETTINGS.requireImage,
    scope: row.scope,
    status: row.status,
    tiendanubeId: row.tiendanube_id,
    updatedAt: row.updated_at,
    widgetEnabled: row.widget_enabled ?? DEFAULT_STORE_WIDGET_SETTINGS.widgetEnabled,
    widgetSubtitle: row.widget_subtitle ?? DEFAULT_STORE_WIDGET_SETTINGS.widgetSubtitle,
    widgetTitle: row.widget_title ?? DEFAULT_STORE_WIDGET_SETTINGS.widgetTitle,
  };
};

const selectStoreByTiendaNubeId = async (tiendanubeId: string): Promise<StoreRecord | null> => {
  const rows = await prisma.$queryRaw<StoreRow[]>`
    SELECT
      id,
      tiendanube_id,
      access_token,
      scope,
      status,
      recommendation_algorithm,
      hide_out_of_stock,
      manual_recommendation_product_ids,
      require_image,
      background_color,
      accent_color,
      border_radius,
      widget_enabled,
      product_page_enabled,
      cart_page_enabled,
      discount_promotion_id,
      widget_title,
      widget_subtitle,
      quick_add_label,
      recommendation_limit,
      created_at,
      updated_at
    FROM "stores"
    WHERE "tiendanube_id" = ${tiendanubeId}
    LIMIT 1
  `;

  return rows[0] ? mapStoreRow(rows[0]) : null;
};

const selectStoreByTiendaNubeIdWithBootstrap = async (
  tiendanubeId: string,
): Promise<StoreRecord | null> => {
  try {
    return await selectStoreByTiendaNubeId(tiendanubeId);
  } catch {
    await ensureStorePersistence();
    return selectStoreByTiendaNubeId(tiendanubeId);
  }
};

export const upsertStoreInstallation = async (
  input: UpsertStoreInstallationInput,
): Promise<StoreRecord> => {
  await ensureStorePersistence();

  await prisma.store.upsert({
    create: {
      accessToken: input.accessToken,
      scope: input.scope,
      status: input.status ?? StoreStatus.ACTIVE,
      tiendanubeId: input.tiendanubeId,
    },
    update: {
      accessToken: input.accessToken,
      scope: input.scope,
      status: input.status ?? StoreStatus.ACTIVE,
    },
    where: {
      tiendanubeId: input.tiendanubeId,
    },
  });

  const store = await selectStoreByTiendaNubeId(input.tiendanubeId);

  if (!store) {
    throw new Error(`Store ${input.tiendanubeId} was not found after installation upsert`);
  }

  return store;
};

export const getStoreByTiendaNubeId = async (
  tiendanubeId: string,
): Promise<StoreRecord | null> => {
  return selectStoreByTiendaNubeIdWithBootstrap(tiendanubeId);
};

export const getStoreWidgetSettings = (store: StoreRecord): StoreWidgetSettings => {
  return {
    accentColor: normalizeColor(store.accentColor, DEFAULT_STORE_WIDGET_SETTINGS.accentColor),
    backgroundColor: normalizeColor(
      store.backgroundColor,
      DEFAULT_STORE_WIDGET_SETTINGS.backgroundColor,
    ),
    borderRadius: clamp(store.borderRadius, 8, 32),
    cartPageEnabled: store.cartPageEnabled,
    desktopColumns: normalizeDesktopColumns(
      store.desktopColumns,
      DEFAULT_STORE_WIDGET_SETTINGS.desktopColumns,
    ),
    discountPercentage: normalizeDiscountPercentage(
      store.discountPercentage,
      DEFAULT_STORE_WIDGET_SETTINGS.discountPercentage,
    ),
    fontColor: normalizeColor(store.fontColor, DEFAULT_STORE_WIDGET_SETTINGS.fontColor),
    fontFamily: normalizeFontFamily(store.fontFamily, DEFAULT_STORE_WIDGET_SETTINGS.fontFamily),
    hideOutOfStock: store.hideOutOfStock,
    manualRecommendations: store.manualRecommendations,
    manualRecommendationProductIds: store.manualRecommendationProductIds,
    mobileColumns: normalizeMobileColumns(
      store.mobileColumns,
      DEFAULT_STORE_WIDGET_SETTINGS.mobileColumns,
    ),
    productPageEnabled: store.productPageEnabled,
    quickAddLabel: store.quickAddLabel,
    recommendationAlgorithm: normalizeStrategy(
      store.recommendationAlgorithm,
      DEFAULT_STORE_WIDGET_SETTINGS.recommendationAlgorithm,
    ),
    recommendationLimit: clamp(store.recommendationLimit, 1, 8),
    requireImage: store.requireImage,
    widgetEnabled: store.widgetEnabled,
    widgetSubtitle: store.widgetSubtitle,
    widgetTitle: store.widgetTitle,
  };
};

export const getActiveStoreOrThrow = async (tiendanubeId: string): Promise<StoreRecord> => {
  const store = await getStoreByTiendaNubeId(tiendanubeId);

  if (!store || store.status !== StoreStatus.ACTIVE) {
    throw new Error(`Store ${tiendanubeId} is not active or does not exist`);
  }

  return store;
};

export const setStoreStatus = async (
  tiendanubeId: string,
  status: StoreStatus,
): Promise<StoreRecord | null> => {
  await ensureStorePersistence();

  const existingStore = await getStoreByTiendaNubeId(tiendanubeId);

  if (!existingStore) {
    return null;
  }

  await prisma.store.update({
    data: {
      status,
    },
    where: {
      tiendanubeId,
    },
  });

  return selectStoreByTiendaNubeId(tiendanubeId);
};

export const deleteStoreByTiendaNubeId = async (tiendanubeId: string): Promise<boolean> => {
  await ensureStorePersistence();

  const existingStore = await getStoreByTiendaNubeId(tiendanubeId);

  if (!existingStore) {
    return false;
  }

  await prisma.store.delete({
    where: {
      tiendanubeId,
    },
  });

  return true;
};

export const listRecentStores = async (limit = 6): Promise<StoreRecord[]> => {
  await ensureStorePersistence();

  const rows = await prisma.$queryRaw<StoreRow[]>`
    SELECT
      id,
      tiendanube_id,
      access_token,
      scope,
      status,
      recommendation_algorithm,
      hide_out_of_stock,
      manual_recommendation_product_ids,
      require_image,
      background_color,
      accent_color,
      border_radius,
      widget_enabled,
      product_page_enabled,
      cart_page_enabled,
      discount_promotion_id,
      widget_title,
      widget_subtitle,
      quick_add_label,
      recommendation_limit,
      created_at,
      updated_at
    FROM "stores"
    ORDER BY "updated_at" DESC
    LIMIT ${limit}
  `;

  return rows.map(mapStoreRow);
};

export const updateStoreWidgetSettings = async (
  tiendanubeId: string,
  input: UpdateStoreWidgetSettingsInput,
): Promise<StoreRecord | null> => {
  await ensureStorePersistence();

  const existingStore = await getStoreByTiendaNubeId(tiendanubeId);

  if (!existingStore) {
    return null;
  }

  await prisma.$executeRaw`
    UPDATE "stores"
    SET
      "background_color" = ${normalizeColor(
        input.backgroundColor,
        existingStore.backgroundColor,
      )},
      "accent_color" = ${normalizeColor(input.accentColor, existingStore.accentColor)},
      "border_radius" = ${clamp(
        input.borderRadius ?? existingStore.borderRadius,
        8,
        32,
      )},
      "recommendation_algorithm" = ${normalizeStrategy(
        input.recommendationAlgorithm,
        existingStore.recommendationAlgorithm,
      )},
      "hide_out_of_stock" = ${input.hideOutOfStock ?? existingStore.hideOutOfStock},
      "manual_recommendation_product_ids" = ${serializeManualMerchandisingState({
        desktopColumns: normalizeDesktopColumns(
          input.desktopColumns,
          existingStore.desktopColumns,
        ),
        discountPercentage: normalizeDiscountPercentage(
          input.discountPercentage,
          existingStore.discountPercentage,
        ),
        fontColor: normalizeColor(input.fontColor, existingStore.fontColor),
        fontFamily: normalizeFontFamily(input.fontFamily, existingStore.fontFamily),
        mobileColumns: normalizeMobileColumns(
          input.mobileColumns,
          existingStore.mobileColumns,
        ),
        recommendations: input.manualRecommendations ?? existingStore.manualRecommendations,
        productIds: input.manualRecommendationProductIds ?? existingStore.manualRecommendationProductIds,
      })},
      "require_image" = ${input.requireImage ?? existingStore.requireImage},
      "widget_enabled" = ${input.widgetEnabled ?? existingStore.widgetEnabled},
      "product_page_enabled" = ${input.productPageEnabled ?? existingStore.productPageEnabled},
      "cart_page_enabled" = ${input.cartPageEnabled ?? existingStore.cartPageEnabled},
      "widget_title" = ${input.widgetTitle?.trim().slice(0, 96) || existingStore.widgetTitle},
      "widget_subtitle" = ${input.widgetSubtitle?.trim().slice(0, 180) || existingStore.widgetSubtitle},
      "quick_add_label" = ${input.quickAddLabel?.trim().slice(0, 24) || existingStore.quickAddLabel},
      "recommendation_limit" = ${clamp(
        input.recommendationLimit ?? existingStore.recommendationLimit,
        1,
        8,
      )},
      "updated_at" = NOW()
    WHERE "tiendanube_id" = ${tiendanubeId}
  `;

  return selectStoreByTiendaNubeId(tiendanubeId);
};

export const setStoreDiscountPromotionId = async (
  tiendanubeId: string,
  discountPromotionId: string | null,
): Promise<StoreRecord | null> => {
  await ensureStorePersistence();

  const existingStore = await getStoreByTiendaNubeId(tiendanubeId);

  if (!existingStore) {
    return null;
  }

  await prisma.store.update({
    data: {
      discountPromotionId,
    },
    where: {
      tiendanubeId,
    },
  });

  return selectStoreByTiendaNubeId(tiendanubeId);
};
