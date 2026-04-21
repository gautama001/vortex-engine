import { getTiendaNubeConfig } from "@/lib/env";
import { TiendaNubeClient } from "@/lib/tiendanube/client";
import type {
  TiendaNubeDiscountCallbackPayload,
  TiendaNubePromotion,
  TiendaNubePromotionCreatePayload,
} from "@/lib/tiendanube/types";
import type { StoreRecord } from "@/services/store-service";
import { setStoreDiscountPromotionId } from "@/services/store-service";

type TiendaNubeStoreCredentials = {
  accessToken: string;
  storeId: string;
};

const buildClient = (credentials: TiendaNubeStoreCredentials): TiendaNubeClient => {
  return new TiendaNubeClient({
    accessToken: credentials.accessToken,
    storeId: credentials.storeId,
  });
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

export const listStorePromotions = async (
  credentials: TiendaNubeStoreCredentials,
): Promise<TiendaNubePromotion[]> => {
  return buildClient(credentials).get<TiendaNubePromotion[]>("/promotions");
};

export const ensureStoreDiscountIntegration = async (
  store: StoreRecord,
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

  await registerStoreDiscountCallback(credentials, callbackUrl);

  if (store.discountPromotionId) {
    const promotions = await listStorePromotions(credentials);
    const existingPromotion = promotions.find(
      (promotion) =>
        String(promotion.id) === store.discountPromotionId &&
        promotion.status === "active" &&
        promotion.execution_tier === "line_item",
    );

    if (existingPromotion) {
      return {
        callbackUrl,
        promotionId: store.discountPromotionId,
      };
    }

    await setStoreDiscountPromotionId(store.tiendanubeId, null);
  }

  const promotion = await createStorePromotion(credentials, {
    execution_tier: "line_item",
    name: `Vortex discounts for store ${store.tiendanubeId}`,
    status: "active",
  });

  await setStoreDiscountPromotionId(store.tiendanubeId, String(promotion.id));

  return {
    callbackUrl,
    promotionId: String(promotion.id),
  };
};
