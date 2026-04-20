import { TiendaNubeClient } from "@/lib/tiendanube/client";
import type {
  TiendaNubeCharge,
  TiendaNubeChargeCreatePayload,
  TiendaNubeSubscription,
  TiendaNubeSubscriptionCreatePayload,
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

export const createStoreCharge = async (
  credentials: TiendaNubeStoreCredentials,
  payload: TiendaNubeChargeCreatePayload,
): Promise<TiendaNubeCharge> => {
  return buildClient(credentials).post<TiendaNubeCharge, TiendaNubeChargeCreatePayload>(
    "/application_charges",
    payload,
  );
};

export const createStoreSubscription = async (
  credentials: TiendaNubeStoreCredentials,
  payload: TiendaNubeSubscriptionCreatePayload,
): Promise<TiendaNubeSubscription> => {
  return buildClient(credentials).post<
    TiendaNubeSubscription,
    TiendaNubeSubscriptionCreatePayload
  >("/recurring_application_charges", payload);
};
