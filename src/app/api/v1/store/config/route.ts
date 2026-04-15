import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ADMIN_SESSION_COOKIE, verifySignedSessionValue } from "@/lib/security";
import { clamp } from "@/lib/utils";
import {
  DEFAULT_STORE_WIDGET_SETTINGS,
  updateStoreWidgetSettings,
  type StoreWidgetSettings,
} from "@/services/store-service";
import { ESTRATEGIAS, type StrategyValue } from "@/components/dashboard/types";

export const runtime = "nodejs";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "Content-Type": "application/json; charset=utf-8",
  Pragma: "no-cache",
};

const normalizeColor = (value: unknown, fallback: string): string => {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value.trim())
    ? value.trim().toUpperCase()
    : fallback;
};

const normalizeText = (value: unknown, fallback: string, maxLength: number): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();

  return normalized ? normalized.slice(0, maxLength) : fallback;
};

const normalizeBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === "boolean" ? value : fallback;
};

const VALID_STRATEGIES = new Set<StrategyValue>(ESTRATEGIAS.map((item) => item.valor));

const normalizeStrategy = (value: unknown, fallback: StrategyValue): StrategyValue => {
  return typeof value === "string" && VALID_STRATEGIES.has(value as StrategyValue)
    ? (value as StrategyValue)
    : fallback;
};

const normalizeStoreConfigPayload = (payload: unknown): Partial<StoreWidgetSettings> => {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const config = payload as Record<string, unknown>;

  return {
    accentColor: normalizeColor(config.accentColor, DEFAULT_STORE_WIDGET_SETTINGS.accentColor),
    backgroundColor: normalizeColor(
      config.backgroundColor,
      DEFAULT_STORE_WIDGET_SETTINGS.backgroundColor,
    ),
    borderRadius: clamp(
      typeof config.borderRadius === "number"
        ? config.borderRadius
        : Number(config.borderRadius ?? DEFAULT_STORE_WIDGET_SETTINGS.borderRadius),
      8,
      32,
    ),
    cartPageEnabled: normalizeBoolean(
      config.cartPageEnabled,
      DEFAULT_STORE_WIDGET_SETTINGS.cartPageEnabled,
    ),
    hideOutOfStock: normalizeBoolean(
      config.hideOutOfStock,
      DEFAULT_STORE_WIDGET_SETTINGS.hideOutOfStock,
    ),
    productPageEnabled: normalizeBoolean(
      config.productPageEnabled,
      DEFAULT_STORE_WIDGET_SETTINGS.productPageEnabled,
    ),
    quickAddLabel: normalizeText(
      config.quickAddLabel,
      DEFAULT_STORE_WIDGET_SETTINGS.quickAddLabel,
      24,
    ),
    recommendationLimit: clamp(
      typeof config.recommendationLimit === "number"
        ? config.recommendationLimit
        : Number(config.recommendationLimit ?? DEFAULT_STORE_WIDGET_SETTINGS.recommendationLimit),
      1,
      8,
    ),
    recommendationAlgorithm: normalizeStrategy(
      config.recommendationAlgorithm,
      DEFAULT_STORE_WIDGET_SETTINGS.recommendationAlgorithm,
    ),
    requireImage: normalizeBoolean(config.requireImage, DEFAULT_STORE_WIDGET_SETTINGS.requireImage),
    widgetEnabled: normalizeBoolean(config.widgetEnabled, DEFAULT_STORE_WIDGET_SETTINGS.widgetEnabled),
    widgetSubtitle: normalizeText(
      config.widgetSubtitle,
      DEFAULT_STORE_WIDGET_SETTINGS.widgetSubtitle,
      180,
    ),
    widgetTitle: normalizeText(config.widgetTitle, DEFAULT_STORE_WIDGET_SETTINGS.widgetTitle, 96),
  };
};

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        {
          error: "missing_admin_session",
          message: "Missing signed admin session",
        },
        {
          headers: noStoreHeaders,
          status: 401,
        },
      );
    }

    const clientSecret = getTiendaNubeConfig().clientSecret;
    const verifiedSession = await verifySignedSessionValue(sessionCookie, clientSecret);

    if (!verifiedSession?.storeId) {
      return NextResponse.json(
        {
          error: "invalid_admin_session",
          message: "Admin session is invalid or expired",
        },
        {
          headers: noStoreHeaders,
          status: 401,
        },
      );
    }

    const rawPayload = (await request.json()) as { config?: unknown; storeId?: unknown };
    const requestedStoreId =
      typeof rawPayload?.storeId === "string" ? rawPayload.storeId.trim() : "";

    if (requestedStoreId && requestedStoreId !== verifiedSession.storeId) {
      return NextResponse.json(
        {
          error: "store_session_mismatch",
          message: "The requested store does not match the signed admin session",
        },
        {
          headers: noStoreHeaders,
          status: 403,
        },
      );
    }

    const updatedStore = await updateStoreWidgetSettings(
      verifiedSession.storeId,
      normalizeStoreConfigPayload(rawPayload?.config),
    );

    if (!updatedStore) {
      return NextResponse.json(
        {
          error: "store_not_found",
          message: "The signed store was not found in Vortex",
        },
        {
          headers: noStoreHeaders,
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        config: {
          accentColor: updatedStore.accentColor,
          backgroundColor: updatedStore.backgroundColor,
          borderRadius: updatedStore.borderRadius,
          cartPageEnabled: updatedStore.cartPageEnabled,
          hideOutOfStock: updatedStore.hideOutOfStock,
          productPageEnabled: updatedStore.productPageEnabled,
          quickAddLabel: updatedStore.quickAddLabel,
          recommendationAlgorithm: updatedStore.recommendationAlgorithm,
          recommendationLimit: updatedStore.recommendationLimit,
          requireImage: updatedStore.requireImage,
          widgetEnabled: updatedStore.widgetEnabled,
          widgetSubtitle: updatedStore.widgetSubtitle,
          widgetTitle: updatedStore.widgetTitle,
        },
        status: "ok",
        storeId: updatedStore.tiendanubeId,
        updatedAt: updatedStore.updatedAt.toISOString(),
      },
      {
        headers: noStoreHeaders,
        status: 200,
      },
    );
  } catch (error) {
    logger.error("Store config patch failed", {
      error,
    });

    return NextResponse.json(
      {
        error: "store_config_update_failed",
        message: "Unable to update store configuration",
      },
      {
        headers: noStoreHeaders,
        status: 500,
      },
    );
  }
}
