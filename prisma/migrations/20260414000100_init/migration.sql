CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'UNINSTALLED');

CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "tiendanube_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" "StoreStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stores_tiendanube_id_key" ON "stores"("tiendanube_id");
CREATE INDEX "stores_status_idx" ON "stores"("status");
