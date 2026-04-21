import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { ensureStorePersistence } from "@/lib/store-persistence";

type OrderAttributionRow = {
  attributed_at: Date;
  order_id: string;
  source: string;
};

type MarkOrderAttributionInput = {
  attributedAt?: Date;
  orderId: number | string;
  source?: string;
  storeId: string;
};

export const markOrderAttribution = async ({
  attributedAt = new Date(),
  orderId,
  source = "vortex_widget",
  storeId,
}: MarkOrderAttributionInput): Promise<void> => {
  await ensureStorePersistence();

  const normalizedOrderId = String(orderId).trim();

  await prisma.$executeRaw`
    INSERT INTO "order_attributions" (
      "id",
      "store_id",
      "order_id",
      "source",
      "attributed_at",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${randomUUID()},
      ${storeId},
      ${normalizedOrderId},
      ${source},
      ${attributedAt},
      NOW(),
      NOW()
    )
    ON CONFLICT ("store_id", "order_id")
    DO UPDATE
    SET
      "source" = EXCLUDED."source",
      "attributed_at" = EXCLUDED."attributed_at",
      "updated_at" = NOW()
  `;
};

export const listAttributedOrderIds = async (
  storeId: string,
  range?: {
    from?: Date | null;
    to?: Date | null;
  },
): Promise<Set<string>> => {
  await ensureStorePersistence();

  const rows = await prisma.$queryRaw<OrderAttributionRow[]>`
    SELECT "order_id", "source", "attributed_at"
    FROM "order_attributions"
    WHERE "store_id" = ${storeId}
      AND (${range?.from ?? null}::timestamp IS NULL OR "attributed_at" >= ${range?.from ?? null})
      AND (${range?.to ?? null}::timestamp IS NULL OR "attributed_at" <= ${range?.to ?? null})
  `;

  return new Set(rows.map((row) => row.order_id));
};
