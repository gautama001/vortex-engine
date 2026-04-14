import { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __vortexStorePersistenceReady__: Promise<void> | undefined;
}

const bootstrapStorePersistence = async (): Promise<void> => {
  const bootstrapDatabaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  const bootstrapPrisma = bootstrapDatabaseUrl
    ? new PrismaClient({
        datasources: {
          db: {
            url: bootstrapDatabaseUrl,
          },
        },
      })
    : prisma;

  try {
    await bootstrapPrisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'StoreStatus'
      ) THEN
        CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'UNINSTALLED');
      END IF;
    END
    $$;
  `);

    await bootstrapPrisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "stores" (
      "id" TEXT NOT NULL,
      "tiendanube_id" TEXT NOT NULL,
      "access_token" TEXT NOT NULL,
      "scope" TEXT NOT NULL,
      "status" "StoreStatus" NOT NULL DEFAULT 'PENDING',
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
    );
  `);

    await bootstrapPrisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "stores_tiendanube_id_key"
    ON "stores"("tiendanube_id");
  `);

    await bootstrapPrisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "stores_status_idx"
    ON "stores"("status");
  `);

    await bootstrapPrisma.$executeRawUnsafe(`
    ALTER TABLE "stores"
    ADD COLUMN IF NOT EXISTS "widget_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS "product_page_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS "cart_page_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS "widget_title" TEXT NOT NULL DEFAULT 'Llevate algo que combine mejor con esta compra',
    ADD COLUMN IF NOT EXISTS "widget_subtitle" TEXT NOT NULL DEFAULT 'Vortex selecciona sugerencias de alta afinidad y activa fallback de cold start para convertir.',
    ADD COLUMN IF NOT EXISTS "quick_add_label" TEXT NOT NULL DEFAULT 'Quick Add',
    ADD COLUMN IF NOT EXISTS "recommendation_limit" INTEGER NOT NULL DEFAULT 4;
  `);
  } finally {
    if (bootstrapPrisma !== prisma) {
      await bootstrapPrisma.$disconnect();
    }
  }
};

export const ensureStorePersistence = async (): Promise<void> => {
  if (!globalThis.__vortexStorePersistenceReady__) {
    globalThis.__vortexStorePersistenceReady__ = bootstrapStorePersistence().catch((error) => {
      globalThis.__vortexStorePersistenceReady__ = undefined;
      throw error;
    });
  }

  await globalThis.__vortexStorePersistenceReady__;
};
