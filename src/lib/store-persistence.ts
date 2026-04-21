import { prisma } from "@/lib/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __vortexStorePersistenceReady__: Promise<void> | undefined;
}

type StorePersistenceProbeRow = {
  fbt_table: string | null;
  order_attributions_table: string | null;
  store_status_type: string | null;
  stores_table: string | null;
};

const verifyStorePersistence = async (): Promise<void> => {
  await prisma.$queryRaw`SELECT 1`;

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "stores"
    ADD COLUMN IF NOT EXISTS "discount_promotion_id" TEXT
  `);

  const probeRows = await prisma.$queryRaw<StorePersistenceProbeRow[]>`
    SELECT
      to_regclass('public.stores')::text AS stores_table,
      to_regtype('"StoreStatus"')::text AS store_status_type,
      to_regclass('public.fbt_recommendations')::text AS fbt_table,
      to_regclass('public.order_attributions')::text AS order_attributions_table
  `;

  const probe = probeRows[0];

  if (!probe?.stores_table || !probe?.store_status_type) {
    throw new Error(
      "Persistence schema is missing required TiendaNube store tables. Run Prisma migrations or deploy a database push before opening /app.",
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
