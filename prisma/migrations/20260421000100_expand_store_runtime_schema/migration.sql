ALTER TABLE "stores"
  ADD COLUMN IF NOT EXISTS "widget_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "product_page_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "cart_page_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "background_color" TEXT NOT NULL DEFAULT '#0A0F1A',
  ADD COLUMN IF NOT EXISTS "accent_color" TEXT NOT NULL DEFAULT '#58E2F3',
  ADD COLUMN IF NOT EXISTS "border_radius" INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS "recommendation_algorithm" TEXT NOT NULL DEFAULT 'ia-inteligente',
  ADD COLUMN IF NOT EXISTS "hide_out_of_stock" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "manual_recommendation_product_ids" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "require_image" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "widget_title" TEXT NOT NULL DEFAULT 'Llevate algo que combine mejor con esta compra',
  ADD COLUMN IF NOT EXISTS "widget_subtitle" TEXT NOT NULL DEFAULT 'Vortex selecciona sugerencias de alta afinidad y activa fallback de cold start para convertir.',
  ADD COLUMN IF NOT EXISTS "quick_add_label" TEXT NOT NULL DEFAULT 'Quick Add',
  ADD COLUMN IF NOT EXISTS "recommendation_limit" INTEGER NOT NULL DEFAULT 4;

CREATE TABLE IF NOT EXISTS "fbt_recommendations" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "related_product_id" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fbt_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "order_attributions" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'vortex_widget',
    "attributed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_attributions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "fbt_recommendations_store_product_related_key"
  ON "fbt_recommendations"("store_id", "product_id", "related_product_id");

CREATE INDEX IF NOT EXISTS "fbt_recommendations_store_product_idx"
  ON "fbt_recommendations"("store_id", "product_id");

CREATE UNIQUE INDEX IF NOT EXISTS "order_attributions_store_order_key"
  ON "order_attributions"("store_id", "order_id");

CREATE INDEX IF NOT EXISTS "order_attributions_store_attributed_idx"
  ON "order_attributions"("store_id", "attributed_at");
