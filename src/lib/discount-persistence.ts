import { prisma } from "@/lib/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __vortexDiscountPersistenceReady__: Promise<void> | undefined;
}

const bootstrapDiscountPersistence = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "discount_rules" (
      "id" TEXT PRIMARY KEY,
      "store_id" TEXT NOT NULL,
      "source" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "discount_type" TEXT NOT NULL,
      "discount_value" INTEGER NOT NULL,
      "trigger_product_ids" JSONB NOT NULL DEFAULT '[]'::jsonb,
      "reward_product_ids" JSONB NOT NULL DEFAULT '[]'::jsonb,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "priority" INTEGER NOT NULL DEFAULT 100,
      "start_at" TIMESTAMP NULL,
      "end_at" TIMESTAMP NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discount_rules_store_status_idx"
    ON "discount_rules" ("store_id", "status", "priority")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "offer_sessions" (
      "id" TEXT PRIMARY KEY,
      "store_id" TEXT NOT NULL,
      "discount_rule_id" TEXT NULL,
      "attribution_id" TEXT NULL,
      "trigger_product_id" TEXT NOT NULL,
      "reward_product_id" TEXT NOT NULL,
      "selected_variant_id" TEXT NULL,
      "discount_type" TEXT NOT NULL,
      "discount_value" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "cart_token" TEXT NULL,
      "session_token" TEXT NULL,
      "expires_at" TIMESTAMP NULL,
      "applied_at" TIMESTAMP NULL,
      "converted_at" TIMESTAMP NULL,
      "invalidated_at" TIMESTAMP NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "offer_sessions_store_status_idx"
    ON "offer_sessions" ("store_id", "status", "created_at")
  `);
};

export const ensureDiscountPersistence = async (): Promise<void> => {
  if (!globalThis.__vortexDiscountPersistenceReady__) {
    globalThis.__vortexDiscountPersistenceReady__ = bootstrapDiscountPersistence().catch(
      (error) => {
        globalThis.__vortexDiscountPersistenceReady__ = undefined;
        throw error;
      },
    );
  }

  await globalThis.__vortexDiscountPersistenceReady__;
};
