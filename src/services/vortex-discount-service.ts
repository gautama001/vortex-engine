import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { ensureDiscountPersistence } from "@/lib/discount-persistence";

export type VortexDiscountSource = "fbt" | "ia" | "manual";
export type VortexDiscountType = "percentage";
export type VortexDiscountRuleStatus = "ACTIVE" | "ARCHIVED" | "PAUSED";
export type VortexOfferSessionStatus =
  | "APPLIED"
  | "CONVERTED"
  | "EXPIRED"
  | "INVALIDATED"
  | "PENDING";

type DiscountRuleRow = {
  created_at: Date;
  discount_type: VortexDiscountType;
  discount_value: number;
  end_at: Date | null;
  id: string;
  name: string;
  priority: number;
  reward_product_ids: unknown;
  source: VortexDiscountSource;
  start_at: Date | null;
  status: VortexDiscountRuleStatus;
  store_id: string;
  trigger_product_ids: unknown;
  updated_at: Date;
};

type OfferSessionRow = {
  applied_at: Date | null;
  attribution_id: string | null;
  cart_token: string | null;
  converted_at: Date | null;
  created_at: Date;
  discount_rule_id: string | null;
  discount_type: VortexDiscountType;
  discount_value: number;
  expires_at: Date | null;
  id: string;
  invalidated_at: Date | null;
  reward_product_id: string;
  selected_variant_id: string | null;
  session_token: string | null;
  status: VortexOfferSessionStatus;
  store_id: string;
  trigger_product_id: string;
  updated_at: Date;
};

export type VortexDiscountRule = {
  createdAt: Date;
  discountType: VortexDiscountType;
  discountValue: number;
  endAt: Date | null;
  id: string;
  name: string;
  priority: number;
  rewardProductIds: number[];
  source: VortexDiscountSource;
  startAt: Date | null;
  status: VortexDiscountRuleStatus;
  storeId: string;
  triggerProductIds: number[];
  updatedAt: Date;
};

export type VortexOfferSession = {
  appliedAt: Date | null;
  attributionId: string | null;
  cartToken: string | null;
  convertedAt: Date | null;
  createdAt: Date;
  discountRuleId: string | null;
  discountType: VortexDiscountType;
  discountValue: number;
  expiresAt: Date | null;
  id: string;
  invalidatedAt: Date | null;
  rewardProductId: string;
  selectedVariantId: string | null;
  sessionToken: string | null;
  status: VortexOfferSessionStatus;
  storeId: string;
  triggerProductId: string;
  updatedAt: Date;
};

type UpsertDiscountRuleInput = {
  discountType?: VortexDiscountType;
  discountValue: number;
  endAt?: Date | null;
  id?: string;
  name: string;
  priority?: number;
  rewardProductIds: Array<number | string>;
  source: VortexDiscountSource;
  startAt?: Date | null;
  status?: VortexDiscountRuleStatus;
  storeId: string;
  triggerProductIds: Array<number | string>;
};

type CreateOfferSessionInput = {
  attributionId?: string | null;
  cartToken?: string | null;
  discountRuleId?: string | null;
  discountType?: VortexDiscountType;
  discountValue: number;
  expiresAt?: Date | null;
  rewardProductId: number | string;
  selectedVariantId?: number | string | null;
  sessionToken?: string | null;
  storeId: string;
  triggerProductId: number | string;
};

type UpdateOfferSessionStatusInput = {
  appliedAt?: Date | null;
  convertedAt?: Date | null;
  id: string;
  invalidatedAt?: Date | null;
  status: VortexOfferSessionStatus;
};

declare global {
  // eslint-disable-next-line no-var
  var __vortexOfferSessionCache__: Map<string, VortexOfferSession[]> | undefined;
}

const getOfferSessionCache = (): Map<string, VortexOfferSession[]> => {
  if (!globalThis.__vortexOfferSessionCache__) {
    globalThis.__vortexOfferSessionCache__ = new Map<string, VortexOfferSession[]>();
  }

  return globalThis.__vortexOfferSessionCache__;
};

const isOfferSessionActive = (session: VortexOfferSession, now = Date.now()): boolean => {
  if (session.status !== "PENDING" && session.status !== "APPLIED") {
    return false;
  }

  if (session.expiresAt && session.expiresAt.getTime() <= now) {
    return false;
  }

  return true;
};

const readCachedOfferSessions = (storeId: string): VortexOfferSession[] => {
  const cache = getOfferSessionCache();
  const cachedSessions = cache.get(storeId) ?? [];
  const activeSessions = cachedSessions.filter((session) => isOfferSessionActive(session));

  if (activeSessions.length !== cachedSessions.length) {
    cache.set(storeId, activeSessions);
  }

  return activeSessions;
};

const writeCachedOfferSessions = (
  storeId: string,
  updater: (sessions: VortexOfferSession[]) => VortexOfferSession[],
): void => {
  const cache = getOfferSessionCache();
  const nextSessions = updater(readCachedOfferSessions(storeId));
  cache.set(
    storeId,
    nextSessions
      .filter((session) => isOfferSessionActive(session))
      .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()),
  );
};

const normalizeNumericIds = (values: Array<number | string>): number[] => {
  return [...new Set(values.map((value) => Number(value)).filter(Number.isFinite))];
};

const parseNumericIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return normalizeNumericIds(value as Array<number | string>);
};

const mapDiscountRule = (row: DiscountRuleRow): VortexDiscountRule => {
  return {
    createdAt: row.created_at,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    endAt: row.end_at,
    id: row.id,
    name: row.name,
    priority: row.priority,
    rewardProductIds: parseNumericIds(row.reward_product_ids),
    source: row.source,
    startAt: row.start_at,
    status: row.status,
    storeId: row.store_id,
    triggerProductIds: parseNumericIds(row.trigger_product_ids),
    updatedAt: row.updated_at,
  };
};

const mapOfferSession = (row: OfferSessionRow): VortexOfferSession => {
  return {
    appliedAt: row.applied_at,
    attributionId: row.attribution_id,
    cartToken: row.cart_token,
    convertedAt: row.converted_at,
    createdAt: row.created_at,
    discountRuleId: row.discount_rule_id,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    expiresAt: row.expires_at,
    id: row.id,
    invalidatedAt: row.invalidated_at,
    rewardProductId: row.reward_product_id,
    selectedVariantId: row.selected_variant_id,
    sessionToken: row.session_token,
    status: row.status,
    storeId: row.store_id,
    triggerProductId: row.trigger_product_id,
    updatedAt: row.updated_at,
  };
};

export const upsertDiscountRule = async (
  input: UpsertDiscountRuleInput,
): Promise<VortexDiscountRule> => {
  await ensureDiscountPersistence();

  const id = input.id ?? randomUUID();
  const triggerProductIds = normalizeNumericIds(input.triggerProductIds);
  const rewardProductIds = normalizeNumericIds(input.rewardProductIds);

  await prisma.$executeRaw`
    INSERT INTO "discount_rules" (
      "id",
      "store_id",
      "source",
      "name",
      "discount_type",
      "discount_value",
      "trigger_product_ids",
      "reward_product_ids",
      "status",
      "priority",
      "start_at",
      "end_at",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${id},
      ${input.storeId},
      ${input.source},
      ${input.name.trim()},
      ${input.discountType ?? "percentage"},
      ${input.discountValue},
      ${JSON.stringify(triggerProductIds)}::jsonb,
      ${JSON.stringify(rewardProductIds)}::jsonb,
      ${input.status ?? "ACTIVE"},
      ${input.priority ?? 100},
      ${input.startAt ?? null},
      ${input.endAt ?? null},
      NOW(),
      NOW()
    )
    ON CONFLICT ("id")
    DO UPDATE
    SET
      "source" = EXCLUDED."source",
      "name" = EXCLUDED."name",
      "discount_type" = EXCLUDED."discount_type",
      "discount_value" = EXCLUDED."discount_value",
      "trigger_product_ids" = EXCLUDED."trigger_product_ids",
      "reward_product_ids" = EXCLUDED."reward_product_ids",
      "status" = EXCLUDED."status",
      "priority" = EXCLUDED."priority",
      "start_at" = EXCLUDED."start_at",
      "end_at" = EXCLUDED."end_at",
      "updated_at" = NOW()
  `;

  const rows = await prisma.$queryRaw<DiscountRuleRow[]>`
    SELECT *
    FROM "discount_rules"
    WHERE "id" = ${id}
    LIMIT 1
  `;

  if (!rows[0]) {
    throw new Error(`Discount rule ${id} was not found after upsert`);
  }

  return mapDiscountRule(rows[0]);
};

export const listDiscountRulesByStore = async (
  storeId: string,
  options?: {
    includePaused?: boolean;
  },
): Promise<VortexDiscountRule[]> => {
  await ensureDiscountPersistence();

  const rows = await prisma.$queryRaw<DiscountRuleRow[]>`
    SELECT *
    FROM "discount_rules"
    WHERE "store_id" = ${storeId}
      AND (${options?.includePaused ?? false} = true OR "status" = 'ACTIVE')
    ORDER BY "priority" ASC, "updated_at" DESC
  `;

  return rows.map(mapDiscountRule);
};

export const listActiveOfferSessionsByStore = async (
  storeId: string,
): Promise<VortexOfferSession[]> => {
  const cachedSessions = readCachedOfferSessions(storeId);

  if (cachedSessions.length > 0) {
    return cachedSessions;
  }

  await ensureDiscountPersistence();

  const rows = await prisma.$queryRaw<OfferSessionRow[]>`
    SELECT *
    FROM "offer_sessions"
    WHERE "store_id" = ${storeId}
      AND "status" IN ('PENDING', 'APPLIED')
      AND ("expires_at" IS NULL OR "expires_at" > NOW())
    ORDER BY "updated_at" DESC, "created_at" DESC
  `;

  const sessions = rows.map(mapOfferSession);
  getOfferSessionCache().set(storeId, sessions);

  return sessions;
};

export const createOfferSession = async (
  input: CreateOfferSessionInput,
): Promise<VortexOfferSession> => {
  await ensureDiscountPersistence();

  const id = randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "offer_sessions" (
      "id",
      "store_id",
      "discount_rule_id",
      "attribution_id",
      "trigger_product_id",
      "reward_product_id",
      "selected_variant_id",
      "discount_type",
      "discount_value",
      "status",
      "cart_token",
      "session_token",
      "expires_at",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${id},
      ${input.storeId},
      ${input.discountRuleId ?? null},
      ${input.attributionId ?? null},
      ${String(input.triggerProductId)},
      ${String(input.rewardProductId)},
      ${input.selectedVariantId ? String(input.selectedVariantId) : null},
      ${input.discountType ?? "percentage"},
      ${input.discountValue},
      'PENDING',
      ${input.cartToken ?? null},
      ${input.sessionToken ?? null},
      ${input.expiresAt ?? null},
      NOW(),
      NOW()
    )
  `;

  const rows = await prisma.$queryRaw<OfferSessionRow[]>`
    SELECT *
    FROM "offer_sessions"
    WHERE "id" = ${id}
    LIMIT 1
  `;

  if (!rows[0]) {
    throw new Error(`Offer session ${id} was not found after creation`);
  }

  const session = mapOfferSession(rows[0]);
  writeCachedOfferSessions(input.storeId, (sessions) => [session, ...sessions]);

  return session;
};

export const updateOfferSessionStatus = async ({
  appliedAt,
  convertedAt,
  id,
  invalidatedAt,
  status,
}: UpdateOfferSessionStatusInput): Promise<VortexOfferSession | null> => {
  await ensureDiscountPersistence();

  await prisma.$executeRaw`
    UPDATE "offer_sessions"
    SET
      "status" = ${status},
      "applied_at" = ${appliedAt ?? null},
      "converted_at" = ${convertedAt ?? null},
      "invalidated_at" = ${invalidatedAt ?? null},
      "updated_at" = NOW()
    WHERE "id" = ${id}
  `;

  const rows = await prisma.$queryRaw<OfferSessionRow[]>`
    SELECT *
    FROM "offer_sessions"
    WHERE "id" = ${id}
    LIMIT 1
  `;

  const session = rows[0] ? mapOfferSession(rows[0]) : null;

  if (session) {
    writeCachedOfferSessions(session.storeId, (sessions) => {
      const remainingSessions = sessions.filter((candidate) => candidate.id !== session.id);
      return [session, ...remainingSessions];
    });
  }

  return session;
};

export const invalidateOfferSessionsByTrigger = async (
  storeId: string,
  triggerProductId: number | string,
): Promise<number> => {
  await ensureDiscountPersistence();

  const result = await prisma.$executeRaw`
    UPDATE "offer_sessions"
    SET
      "status" = 'INVALIDATED',
      "invalidated_at" = NOW(),
      "updated_at" = NOW()
    WHERE "store_id" = ${storeId}
      AND "trigger_product_id" = ${String(triggerProductId)}
      AND "status" IN ('PENDING', 'APPLIED')
  `;

  writeCachedOfferSessions(storeId, (sessions) =>
    sessions.map((session) => {
      if (session.triggerProductId !== String(triggerProductId)) {
        return session;
      }

      return {
        ...session,
        invalidatedAt: new Date(),
        status: "INVALIDATED",
        updatedAt: new Date(),
      };
    }),
  );

  return Number(result);
};
