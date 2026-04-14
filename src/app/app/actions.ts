"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getTiendaNubeConfig } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, verifySignedSessionValue } from "@/lib/security";
import { clamp } from "@/lib/utils";
import { updateStoreWidgetSettings } from "@/services/store-service";

export type UpdateStoreSettingsState = {
  message: string;
  status: "error" | "idle" | "success";
};

export const initialUpdateStoreSettingsState: UpdateStoreSettingsState = {
  message: "",
  status: "idle",
};

const normalizeText = (value: FormDataEntryValue | null, fallback: string, maxLength: number): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();

  return normalized ? normalized.slice(0, maxLength) : fallback;
};

export async function updateStoreSettingsAction(
  _previousState: UpdateStoreSettingsState,
  formData: FormData,
): Promise<UpdateStoreSettingsState> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const clientSecret = getTiendaNubeConfig().clientSecret;

  if (!sessionCookie) {
    return {
      message: "No hay una tienda autenticada para actualizar configuracion.",
      status: "error",
    };
  }

  const verifiedSession = await verifySignedSessionValue(sessionCookie, clientSecret);

  if (!verifiedSession?.storeId) {
    return {
      message: "La sesion admin ya no es valida. Reinstala o volve a conectar la tienda.",
      status: "error",
    };
  }

  const recommendationLimit = clamp(
    Number(formData.get("recommendation_limit") ?? "4") || 4,
    1,
    8,
  );

  let updatedStore = null;

  try {
    updatedStore = await updateStoreWidgetSettings(verifiedSession.storeId, {
      cartPageEnabled: formData.get("cart_page_enabled") === "on",
      productPageEnabled: formData.get("product_page_enabled") === "on",
      quickAddLabel: normalizeText(formData.get("quick_add_label"), "Quick Add", 24),
      recommendationLimit,
      widgetEnabled: formData.get("widget_enabled") === "on",
      widgetSubtitle: normalizeText(
        formData.get("widget_subtitle"),
        "Vortex selecciona sugerencias de alta afinidad y activa fallback de cold start para convertir.",
        180,
      ),
      widgetTitle: normalizeText(
        formData.get("widget_title"),
        "Llevate algo que combine mejor con esta compra",
        96,
      ),
    });
  } catch {
    return {
      message: "No pudimos guardar la configuracion. Verifica la base y vuelve a intentar.",
      status: "error",
    };
  }

  if (!updatedStore) {
    return {
      message: "La tienda autenticada ya no existe en Vortex.",
      status: "error",
    };
  }

  revalidatePath("/app");

  return {
    message: "Configuracion guardada. Ya podes volver al storefront y testear el widget.",
    status: "success",
  };
}
