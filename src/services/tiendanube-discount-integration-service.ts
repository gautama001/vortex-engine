import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { TiendaNubeClient } from "@/lib/tiendanube/client";
import type {
  TiendaNubeApiError,
  TiendaNubeDiscountCallbackPayload,
  TiendaNubePromotion,
  TiendaNubePromotionCreatePayload,
} from "@/lib/tiendanube/types";
import type { StoreRecord } from "@/services/store-service";
import { setStoreDiscountPromotionId } from "@/services/store-service";

declare global {
  // eslint-disable-next-line no-var
  var __vortexDiscountIntegrationCache__:
    | Map<
        string,
        {
          promotionId: string | null;
          status: string;
        }
      >
    | undefined;
}

type TiendaNubeStoreCredentials = {
  accessToken: string;
  storeId: string;
};

const normalizePromotionId = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  if (
    !normalized ||
    normalized.toLowerCase() === "undefined" ||
    normalized.toLowerCase() === "null"
  ) {
    return null;
  }

  return normalized;
};

const buildClient = (credentials: TiendaNubeStoreCredentials): TiendaNubeClient => {
  return new TiendaNubeClient({
    accessToken: credentials.accessToken,
    storeId: credentials.storeId,
  });
};

const getDiscountIntegrationCache = (): Map<
  string,
  {
    promotionId: string | null;
    status: string;
  }
> => {
  if (!globalThis.__vortexDiscountIntegrationCache__) {
    globalThis.__vortexDiscountIntegrationCache__ = new Map();
  }

  return globalThis.__vortexDiscountIntegrationCache__;
};

export const primeStoreDiscountIntegrationCache = (input: {
  promotionId: string | null;
  status: string;
  storeId: string;
}): void => {
  getDiscountIntegrationCache().set(input.storeId, {
    promotionId: normalizePromotionId(input.promotionId),
    status: input.status,
  });
};

export const getCachedStoreDiscountIntegration = (storeId: string) => {
  return getDiscountIntegrationCache().get(storeId) ?? null;
};

const isPromotionActive = (promotion: TiendaNubePromotion): boolean => {
  if (typeof promotion.active === "boolean") {
    return promotion.active;
  }

  return promotion.status === "active";
};

const isLineItemPromotion = (promotion: TiendaNubePromotion): boolean => {
  return (
    promotion.execution_tier === "line_item" ||
    promotion.allocation_type === "line_item"
  );
};

export const registerStoreDiscountCallback = async (
  credentials: TiendaNubeStoreCredentials,
  callbackUrl: string,
): Promise<void> => {
  await buildClient(credentials).put<void, TiendaNubeDiscountCallbackPayload>("/discounts/callbacks", {
    url: callbackUrl,
  });
};

export const createStorePromotion = async (
  credentials: TiendaNubeStoreCredentials,
  payload: TiendaNubePromotionCreatePayload,
): Promise<TiendaNubePromotion> => {
  return buildClient(credentials).post<TiendaNubePromotion, TiendaNubePromotionCreatePayload>(
    "/promotions",
    payload,
  );
};

const isBadRequestError = (error: unknown): error is TiendaNubeApiError => {
  return (
    error instanceof Error &&
    error.name === "TiendaNubeApiError" &&
    "status" in error &&
    Number((error as { status?: unknown }).status) === 400
  );
};

const createStorePromotionWithFallback = async (
  credentials: TiendaNubeStoreCredentials,
  storeId: string,
): Promise<TiendaNubePromotion> => {
  const payloads: TiendaNubePromotionCreatePayload[] = [
    {
      active: true,
      allocation_type: "line_item",
      combines_with_other_discounts: true,
      name: `Vortex discounts for store ${storeId}`,
    },
    {
      execution_tier: "line_item",
      name: `Vortex discounts for store ${storeId}`,
      status: "active",
    },
  ];

  let lastError: unknown = null;

  for (const payload of payloads) {
    try {
      return await createStorePromotion(credentials, payload);
    } catch (error) {
      lastError = error;

      if (!isBadRequestError(error)) {
        throw error;
      }

      logger.warn("TiendaNube promotion payload rejected, trying fallback contract", {
        error,
        payload,
        storeId,
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("promotion_creation_failed");
};

export const listStorePromotions = async (
  credentials: TiendaNubeStoreCredentials,
): Promise<TiendaNubePromotion[]> => {
  return buildClient(credentials).get<TiendaNubePromotion[]>("/promotions");
};

export { normalizePromotionId };

export const ensureStoreDiscountIntegration = async (
  store: StoreRecord,
  options?: {
    syncRemote?: boolean;
  },
): Promise<{
  callbackUrl: string;
  promotionId: string;
}> => {
  const appUrl = getTiendaNubeConfig().appUrl;
  const callbackUrl = `${appUrl}/api/discounts/callback`;
  const credentials = {
    accessToken: store.accessToken,
    storeId: store.tiendanubeId,
  };
  const shouldSyncRemote = options?.syncRemote ?? false;
  const persistedPromotionId = normalizePromotionId(store.discountPromotionId);

  if (persistedPromotionId && !shouldSyncRemote) {
    primeStoreDiscountIntegrationCache({
      promotionId: persistedPromotionId,
      status: String(store.status),
      storeId: store.tiendanubeId,
    });

    return {
      callbackUrl,
      promotionId: persistedPromotionId,
    };
  }

  await registerStoreDiscountCallback(credentials, callbackUrl);

  if (!persistedPromotionId && store.discountPromotionId) {
    logger.warn("Discarding invalid persisted TiendaNube promotion id", {
      persistedPromotionId: store.discountPromotionId,
      storeId: store.tiendanubeId,
    });

    await setStoreDiscountPromotionId(store.tiendanubeId, null);
    primeStoreDiscountIntegrationCache({
      promotionId: null,
      status: String(store.status),
      storeId: store.tiendanubeId,
    });
  }

  if (persistedPromotionId && shouldSyncRemote) {
    const promotions = await listStorePromotions(credentials);
    const existingPromotion = promotions.find(
      (promotion) =>
        normalizePromotionId(promotion.id) === persistedPromotionId &&
        isPromotionActive(promotion) &&
        isLineItemPromotion(promotion),
    );

    if (existingPromotion) {
      primeStoreDiscountIntegrationCache({
        promotionId: persistedPromotionId,
        status: String(store.status),
        storeId: store.tiendanubeId,
      });

      return {
        callbackUrl,
        promotionId: persistedPromotionId,
      };
    }

    await setStoreDiscountPromotionId(store.tiendanubeId, null);
    primeStoreDiscountIntegrationCache({
      promotionId: null,
      status: String(store.status),
      storeId: store.tiendanubeId,
    });
  }

  const promotion = await createStorePromotionWithFallback(credentials, store.tiendanubeId);
  const createdPromotionId = normalizePromotionId(promotion.id);

  if (!createdPromotionId) {
    logger.error("TiendaNube promotion creation returned an invalid id", {
      promotion,
      storeId: store.tiendanubeId,
    });
    throw new Error("invalid_tiendanube_promotion_id");
  }

  await setStoreDiscountPromotionId(store.tiendanubeId, createdPromotionId);
  primeStoreDiscountIntegrationCache({
    promotionId: createdPromotionId,
    status: String(store.status),
    storeId: store.tiendanubeId,
  });

  return {
    callbackUrl,
    promotionId: createdPromotionId,
  };
};
