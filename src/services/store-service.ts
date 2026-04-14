import { StoreStatus, type Store as PrismaStore } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureStorePersistence } from "@/lib/store-persistence";
import { clamp } from "@/lib/utils";

type UpsertStoreInstallationInput = {
  accessToken: string;
  scope: string;
  status?: StoreStatus;
  tiendanubeId: string;
};

type StoreRow = {
  access_token: string;
  cart_page_enabled: boolean | null;
  created_at: Date;
  id: string;
  product_page_enabled: boolean | null;
  quick_add_label: string | null;
  recommendation_limit: number | null;
  scope: string;
  status: StoreStatus;
  tiendanube_id: string;
  updated_at: Date;
  widget_enabled: boolean | null;
  widget_subtitle: string | null;
  widget_title: string | null;
};

export type StoreRecord = PrismaStore & {
  cartPageEnabled: boolean;
  productPageEnabled: boolean;
  quickAddLabel: string;
  recommendationLimit: number;
  widgetEnabled: boolean;
  widgetSubtitle: string;
  widgetTitle: string;
};

export type StoreWidgetSettings = {
  cartPageEnabled: boolean;
  productPageEnabled: boolean;
  quickAddLabel: string;
  recommendationLimit: number;
  widgetEnabled: boolean;
  widgetSubtitle: string;
  widgetTitle: string;
};

export const DEFAULT_STORE_WIDGET_SETTINGS: StoreWidgetSettings = {
  cartPageEnabled: true,
  productPageEnabled: true,
  quickAddLabel: "Quick Add",
  recommendationLimit: 4,
  widgetEnabled: true,
  widgetSubtitle:
    "Vortex selecciona sugerencias de alta afinidad y activa fallback de cold start para convertir.",
  widgetTitle: "Llevate algo que combine mejor con esta compra",
};

type UpdateStoreWidgetSettingsInput = Partial<StoreWidgetSettings>;

const mapStoreRow = (row: StoreRow): StoreRecord => {
  return {
    accessToken: row.access_token,
    cartPageEnabled: row.cart_page_enabled ?? DEFAULT_STORE_WIDGET_SETTINGS.cartPageEnabled,
    createdAt: row.created_at,
    id: row.id,
    productPageEnabled:
      row.product_page_enabled ?? DEFAULT_STORE_WIDGET_SETTINGS.productPageEnabled,
    quickAddLabel: row.quick_add_label ?? DEFAULT_STORE_WIDGET_SETTINGS.quickAddLabel,
    recommendationLimit: clamp(
      row.recommendation_limit ?? DEFAULT_STORE_WIDGET_SETTINGS.recommendationLimit,
      1,
      8,
    ),
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
      widget_enabled,
      product_page_enabled,
      cart_page_enabled,
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
  await ensureStorePersistence();
  return selectStoreByTiendaNubeId(tiendanubeId);
};

export const getStoreWidgetSettings = (store: StoreRecord): StoreWidgetSettings => {
  return {
    cartPageEnabled: store.cartPageEnabled,
    productPageEnabled: store.productPageEnabled,
    quickAddLabel: store.quickAddLabel,
    recommendationLimit: clamp(store.recommendationLimit, 1, 8),
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
      widget_enabled,
      product_page_enabled,
      cart_page_enabled,
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
