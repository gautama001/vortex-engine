CREATE TABLE IF NOT EXISTS "discount_rules" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "trigger_product_ids" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "reward_product_ids" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "offer_sessions" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "discount_rule_id" TEXT,
    "attribution_id" TEXT,
    "trigger_product_id" TEXT NOT NULL,
    "reward_product_id" TEXT NOT NULL,
    "selected_variant_id" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cart_token" TEXT,
    "session_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "applied_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "invalidated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "discount_rules_store_status_idx"
  ON "discount_rules"("store_id", "status", "priority");

CREATE INDEX IF NOT EXISTS "offer_sessions_store_status_idx"
  ON "offer_sessions"("store_id", "status", "created_at");
