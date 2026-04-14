"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ADMIN_SESSION_COOKIE, verifySignedSessionValue } from "@/lib/security";
import { clamp } from "@/lib/utils";
import { type UpdateStoreSettingsState } from "@/app/app/store-settings-state";
import { updateStoreWidgetSettings } from "@/services/store-service";

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
  try {
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
    const requestedStoreIdRaw = formData.get("store_id");
    const requestedStoreId =
      typeof requestedStoreIdRaw === "string" ? requestedStoreIdRaw.trim() : "";
    const targetStoreId = requestedStoreId || verifiedSession?.storeId || "";

    if (!verifiedSession?.storeId || !targetStoreId) {
      return {
        message: "La sesion admin ya no es valida. Reinstala o volve a conectar la tienda.",
        status: "error",
      };
    }

    if (requestedStoreId && requestedStoreId !== verifiedSession.storeId) {
      logger.warn("Store settings action detected session/store mismatch", {
        requestedStoreId,
        sessionStoreId: verifiedSession.storeId,
      });
    }

    const recommendationLimit = clamp(
      Number(formData.get("recommendation_limit") ?? "4") || 4,
      1,
      8,
    );

    const updatedStore = await updateStoreWidgetSettings(targetStoreId, {
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

    if (!updatedStore) {
      return {
        message: "La store activa del panel ya no existe en Vortex. Reinstala o recarga el panel.",
        status: "error",
      };
    }

    revalidatePath("/app");

    return {
      message: "Configuracion guardada. Ya podes volver al storefront y testear el widget.",
      status: "success",
    };
  } catch (error) {
    logger.error("Store settings action failed", {
      error,
    });

    return {
      message: "No pudimos guardar la configuracion. Verifica la base y vuelve a intentar.",
      status: "error",
    };
  }
}
