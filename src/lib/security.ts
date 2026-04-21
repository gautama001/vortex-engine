export const ADMIN_SESSION_COOKIE = "vortex_admin_session";
export const OAUTH_STATE_COOKIE = "vortex_oauth_state";

const encoder = new TextEncoder();

const toHex = (input: ArrayBuffer): string => {
  return Array.from(new Uint8Array(input))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const importHmacKey = async (secret: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      hash: "SHA-256",
      name: "HMAC",
    },
    false,
    ["sign"],
  );
};

export const constantTimeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
};

export const hmacSha256Hex = async (secret: string, payload: string): Promise<string> => {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return toHex(signature);
};

export const verifyHmacHex = async (
  secret: string,
  payload: string,
  signature: string,
): Promise<boolean> => {
  const expected = await hmacSha256Hex(secret, payload);

  return constantTimeEqual(expected, signature.trim().toLowerCase());
};

export const buildSignedSessionValue = async (
  storeId: string,
  secret: string,
  ttlMs = 1000 * 60 * 60 * 12,
): Promise<string> => {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${storeId}.${expiresAt}`;
  const signature = await hmacSha256Hex(secret, payload);

  return `${payload}.${signature}`;
};

export const verifySignedSessionValue = async (
  value: string,
  secret: string,
): Promise<{ expiresAt: number; storeId: string } | null> => {
  const parts = value.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [storeId, expiresAtRaw, signature = ""] = parts;
  const expiresAt = Number(expiresAtRaw);

  if (!storeId || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  const payload = `${storeId}.${expiresAt}`;
  const valid = await verifyHmacHex(secret, payload, signature);

  if (!valid) {
    return null;
  }

  return { expiresAt, storeId };
};

export const verifySortedQueryHmac = async (
  params: URLSearchParams,
  secret: string,
): Promise<boolean> => {
  const signature = params.get("hmac");

  if (!signature) {
    return false;
  }

  const normalizedPayload = [...params.entries()]
    .filter(([key]) => key !== "hmac")
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) {
        return leftValue.localeCompare(rightValue);
      }

      return leftKey.localeCompare(rightKey);
    })
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return verifyHmacHex(secret, normalizedPayload, signature);
};

type RecommendationDiscountProofInput = {
  expiresAt?: number;
  recommendationProductIds: Array<number | string>;
  storeId: string;
  strategy: string;
  triggerProductId: number | string | null;
};

type VerifiedRecommendationDiscountProof = {
  expiresAt: number;
  recommendationProductIds: number[];
  storeId: string;
  strategy: string;
  triggerProductId: string | null;
};

const normalizeRecommendationProofProductIds = (
  productIds: Array<number | string>,
): number[] => {
  return [...new Set(productIds.map((value) => Number(value)).filter(Number.isFinite))].sort(
    (left, right) => left - right,
  );
};

const buildRecommendationDiscountProofPayload = ({
  expiresAt,
  recommendationProductIds,
  storeId,
  strategy,
  triggerProductId,
}: Required<RecommendationDiscountProofInput>): string => {
  return [
    storeId.trim(),
    triggerProductId === null ? "none" : String(triggerProductId).trim(),
    strategy.trim(),
    recommendationProductIds.join(","),
    String(expiresAt),
  ].join(".");
};

export const buildRecommendationDiscountProof = async (
  input: RecommendationDiscountProofInput,
  secret: string,
  ttlMs = 1000 * 60 * 60,
): Promise<string> => {
  const expiresAt =
    typeof input.expiresAt === "number" && Number.isFinite(input.expiresAt)
      ? input.expiresAt
      : Date.now() + ttlMs;
  const normalizedRecommendationProductIds = normalizeRecommendationProofProductIds(
    input.recommendationProductIds,
  );
  const payload = buildRecommendationDiscountProofPayload({
    expiresAt,
    recommendationProductIds: normalizedRecommendationProductIds,
    storeId: input.storeId,
    strategy: input.strategy,
    triggerProductId: input.triggerProductId,
  });
  const signature = await hmacSha256Hex(secret, payload);

  return `${payload}.${signature}`;
};

export const verifyRecommendationDiscountProof = async (
  value: string,
  secret: string,
): Promise<VerifiedRecommendationDiscountProof | null> => {
  const parts = value.split(".");

  if (parts.length < 6) {
    return null;
  }

  const signature = parts.pop() ?? "";
  const expiresAtRaw = parts.pop() ?? "";
  const recommendationProductIdsRaw = parts.pop() ?? "";
  const strategy = parts.pop() ?? "";
  const triggerProductIdRaw = parts.pop() ?? "";
  const storeId = parts.join(".");
  const expiresAt = Number(expiresAtRaw);

  if (!storeId || !strategy || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  const recommendationProductIds = normalizeRecommendationProofProductIds(
    recommendationProductIdsRaw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  const payload = buildRecommendationDiscountProofPayload({
    expiresAt,
    recommendationProductIds,
    storeId,
    strategy,
    triggerProductId: triggerProductIdRaw === "none" ? null : triggerProductIdRaw,
  });
  const valid = await verifyHmacHex(secret, payload, signature);

  if (!valid) {
    return null;
  }

  return {
    expiresAt,
    recommendationProductIds,
    storeId,
    strategy,
    triggerProductId: triggerProductIdRaw === "none" ? null : triggerProductIdRaw,
  };
};

export const isRecentTimestamp = (value: string, toleranceMs = 1000 * 60 * 10): boolean => {
  const numericValue = Number(value);
  const parsedValue = Number.isFinite(numericValue)
    ? value.length <= 10
      ? numericValue * 1000
      : numericValue
    : Date.parse(value);

  if (!Number.isFinite(parsedValue)) {
    return false;
  }

  return Math.abs(Date.now() - parsedValue) <= toleranceMs;
};
