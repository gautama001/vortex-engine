import { TiendaNubeClient } from "@/lib/tiendanube/client";
import type {
  TiendaNubeCoupon,
  TiendaNubeCouponCreatePayload,
  TiendaNubeDiscount,
  TiendaNubeDiscountCreatePayload,
} from "@/lib/tiendanube/types";

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

export const listStoreDiscounts = async (
  credentials: TiendaNubeStoreCredentials,
): Promise<TiendaNubeDiscount[]> => {
  return buildClient(credentials).get<TiendaNubeDiscount[]>("/discounts");
};

export const createStoreDiscount = async (
  credentials: TiendaNubeStoreCredentials,
  payload: TiendaNubeDiscountCreatePayload,
): Promise<TiendaNubeDiscount> => {
  return buildClient(credentials).post<TiendaNubeDiscount, TiendaNubeDiscountCreatePayload>(
    "/discounts",
    payload,
  );
};

export const pauseStoreDiscount = async (
  credentials: TiendaNubeStoreCredentials,
  discountId: number | string,
): Promise<TiendaNubeDiscount> => {
  return buildClient(credentials).patch<TiendaNubeDiscount, { status: "paused" }>(
    `/discounts/${discountId}`,
    { status: "paused" },
  );
};

export const activateStoreDiscount = async (
  credentials: TiendaNubeStoreCredentials,
  discountId: number | string,
): Promise<TiendaNubeDiscount> => {
  return buildClient(credentials).patch<TiendaNubeDiscount, { status: "active" }>(
    `/discounts/${discountId}`,
    { status: "active" },
  );
};

export const listStoreCoupons = async (
  credentials: TiendaNubeStoreCredentials,
): Promise<TiendaNubeCoupon[]> => {
  return buildClient(credentials).get<TiendaNubeCoupon[]>("/coupons");
};

export const createStoreCoupon = async (
  credentials: TiendaNubeStoreCredentials,
  payload: TiendaNubeCouponCreatePayload,
): Promise<TiendaNubeCoupon> => {
  return buildClient(credentials).post<TiendaNubeCoupon, TiendaNubeCouponCreatePayload>(
    "/coupons",
    payload,
  );
};

export const deleteStoreCoupon = async (
  credentials: TiendaNubeStoreCredentials,
  couponId: number | string,
): Promise<void> => {
  await buildClient(credentials).delete<null>(`/coupons/${couponId}`);
};
