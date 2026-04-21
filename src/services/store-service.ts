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

const mapStoreModel = (store: PrismaStore): StoreRecord => {
  const manualMerchandisingState = parseManualMerchandisingState(
    store.manualRecommendationProductIds,
  );

  return {
    accessToken: store.accessToken,
    accentColor: normalizeColor(store.accentColor, DEFAULT_STORE_WIDGET_SETTINGS.accentColor),
    backgroundColor: normalizeColor(
      store.backgroundColor,
      DEFAULT_STORE_WIDGET_SETTINGS.backgroundColor,
    ),
    borderRadius: clamp(
      store.borderRadius ?? DEFAULT_STORE_WIDGET_SETTINGS.borderRadius,
      8,
      32,
    ),
    cartPageEnabled: store.cartPageEnabled ?? DEFAULT_STORE_WIDGET_SETTINGS.cartPageEnabled,
    desktopColumns: manualMerchandisingState.desktopColumns,
    discountPercentage: manualMerchandisingState.discountPercentage,
    discountPromotionId: store.discountPromotionId,
    createdAt: store.createdAt,
    fontColor: manualMerchandisingState.fontColor,
    fontFamily: manualMerchandisingState.fontFamily,
    hideOutOfStock: store.hideOutOfStock ?? DEFAULT_STORE_WIDGET_SETTINGS.hideOutOfStock,
    id: store.id,
    manualRecommendations: manualMerchandisingState.recommendations,
    manualRecommendationProductIds: manualMerchandisingState.productIds,
    mobileColumns: manualMerchandisingState.mobileColumns,
    productPageEnabled: store.productPageEnabled ?? DEFAULT_STORE_WIDGET_SETTINGS.productPageEnabled,
    quickAddLabel: store.quickAddLabel ?? DEFAULT_STORE_WIDGET_SETTINGS.quickAddLabel,
    recommendationAlgorithm: normalizeStrategy(
      store.recommendationAlgorithm,
      DEFAULT_STORE_WIDGET_SETTINGS.recommendationAlgorithm,
    ),
    recommendationLimit: clamp(
      store.recommendationLimit ?? DEFAULT_STORE_WIDGET_SETTINGS.recommendationLimit,
      1,
      8,
    ),
    requireImage: store.requireImage ?? DEFAULT_STORE_WIDGET_SETTINGS.requireImage,
    scope: store.scope,
    status: store.status,
    tiendanubeId: store.tiendanubeId,
    updatedAt: store.updatedAt,
    widgetEnabled: store.widgetEnabled ?? DEFAULT_STORE_WIDGET_SETTINGS.widgetEnabled,
    widgetSubtitle: store.widgetSubtitle ?? DEFAULT_STORE_WIDGET_SETTINGS.widgetSubtitle,
    widgetTitle: store.widgetTitle ?? DEFAULT_STORE_WIDGET_SETTINGS.widgetTitle,
  };
};

const selectStoreByTiendaNubeId = async (tiendanubeId: string): Promise<StoreRecord | null> => {
  const store = await prisma.store.findUnique({
    where: {
      tiendanubeId,
    },
  });

  return store ? mapStoreModel(store) : null;
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

  const stores = await prisma.store.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });

  return stores.map(mapStoreModel);
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

  await prisma.store.update({
    data: {
      accentColor: normalizeColor(input.accentColor, existingStore.accentColor),
      backgroundColor: normalizeColor(input.backgroundColor, existingStore.backgroundColor),
      borderRadius: clamp(input.borderRadius ?? existingStore.borderRadius, 8, 32),
      cartPageEnabled: input.cartPageEnabled ?? existingStore.cartPageEnabled,
      hideOutOfStock: input.hideOutOfStock ?? existingStore.hideOutOfStock,
      manualRecommendationProductIds: serializeManualMerchandisingState({
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
        mobileColumns: normalizeMobileColumns(input.mobileColumns, existingStore.mobileColumns),
        recommendations: input.manualRecommendations ?? existingStore.manualRecommendations,
        productIds:
          input.manualRecommendationProductIds ?? existingStore.manualRecommendationProductIds,
      }),
      productPageEnabled: input.productPageEnabled ?? existingStore.productPageEnabled,
      quickAddLabel: input.quickAddLabel?.trim().slice(0, 24) || existingStore.quickAddLabel,
      recommendationAlgorithm: normalizeStrategy(
        input.recommendationAlgorithm,
        existingStore.recommendationAlgorithm,
      ),
      recommendationLimit: clamp(
        input.recommendationLimit ?? existingStore.recommendationLimit,
        1,
        8,
      ),
      requireImage: input.requireImage ?? existingStore.requireImage,
      widgetEnabled: input.widgetEnabled ?? existingStore.widgetEnabled,
      widgetSubtitle:
        input.widgetSubtitle?.trim().slice(0, 180) || existingStore.widgetSubtitle,
      widgetTitle: input.widgetTitle?.trim().slice(0, 96) || existingStore.widgetTitle,
    },
    where: {
      tiendanubeId,
    },
  });

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
