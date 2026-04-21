import { prisma } from "@/lib/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __vortexStorePersistenceReady__: Promise<void> | undefined;
}

const verifyStorePersistence = async (): Promise<void> => {
  try {
    await prisma.$connect();
    await prisma.store.findFirst({
      select: {
        id: true,
      },
    });
  } catch (error) {
    const detail = error instanceof Error && error.message ? ` Detail: ${error.message}` : "";

    throw new Error(
      "Persistence schema is missing or inaccessible for TiendaNube stores. Run Prisma migrations and verify DATABASE_URL/DIRECT_URL before opening /app." +
        detail,
    );
  }
};

export const ensureStorePersistence = async (): Promise<void> => {
  if (!globalThis.__vortexStorePersistenceReady__) {
    globalThis.__vortexStorePersistenceReady__ = verifyStorePersistence().catch((error) => {
      globalThis.__vortexStorePersistenceReady__ = undefined;
      throw error;
    });
  }

  await globalThis.__vortexStorePersistenceReady__;
};
