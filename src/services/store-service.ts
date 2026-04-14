import { StoreStatus, type Store } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type UpsertStoreInstallationInput = {
  accessToken: string;
  scope: string;
  status?: StoreStatus;
  tiendanubeId: string;
};

export const upsertStoreInstallation = async (
  input: UpsertStoreInstallationInput,
): Promise<Store> => {
  return prisma.store.upsert({
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
};

export const getStoreByTiendaNubeId = async (tiendanubeId: string): Promise<Store | null> => {
  return prisma.store.findUnique({
    where: {
      tiendanubeId,
    },
  });
};

export const getActiveStoreOrThrow = async (tiendanubeId: string): Promise<Store> => {
  const store = await getStoreByTiendaNubeId(tiendanubeId);

  if (!store || store.status !== StoreStatus.ACTIVE) {
    throw new Error(`Store ${tiendanubeId} is not active or does not exist`);
  }

  return store;
};

export const setStoreStatus = async (
  tiendanubeId: string,
  status: StoreStatus,
): Promise<Store | null> => {
  const existingStore = await getStoreByTiendaNubeId(tiendanubeId);

  if (!existingStore) {
    return null;
  }

  return prisma.store.update({
    data: {
      status,
    },
    where: {
      tiendanubeId,
    },
  });
};

export const listRecentStores = async (limit = 6): Promise<Store[]> => {
  return prisma.store.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
  });
};
