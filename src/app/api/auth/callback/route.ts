import { NextRequest, NextResponse } from "next/server";

import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ADMIN_SESSION_COOKIE, buildSignedSessionValue, OAUTH_STATE_COOKIE } from "@/lib/security";
import { associateManualScriptToStore, exchangeAuthorizationCode } from "@/lib/tiendanube/auth";
import { TiendaNubeApiError } from "@/lib/tiendanube/types";
import { upsertStoreInstallation } from "@/services/store-service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { appUrl, clientSecret } = getTiendaNubeConfig();
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");
  const persistedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const redirectUrl = new URL("/app", appUrl);

  if (error) {
    logger.warn("TiendaNube OAuth callback returned an error", { error });
    redirectUrl.searchParams.set("error", error);
    return NextResponse.redirect(redirectUrl);
  }

  const hasStateHandshake = Boolean(state || persistedState);
  const invalidState =
    hasStateHandshake && (!state || !persistedState || persistedState !== state);

  if (!code || invalidState) {
    logger.warn("Rejected OAuth callback due to invalid state", {
      hasCode: Boolean(code),
      hasStateHandshake,
      hasState: Boolean(state),
      persistedState: Boolean(persistedState),
    });
    redirectUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const token = await exchangeAuthorizationCode(code);

    let store;
    try {
      store = await upsertStoreInstallation({
        accessToken: token.access_token,
        scope: token.scope,
        tiendanubeId: token.user_id,
      });
    } catch (storePersistenceError) {
      logger.error("OAuth callback failed while persisting store installation", {
        error: storePersistenceError,
        scope: token.scope,
        storeId: token.user_id,
      });
      redirectUrl.searchParams.set("error", "store_persistence_failed");
      redirectUrl.searchParams.set("store_id", token.user_id);

      if (storePersistenceError instanceof Error && storePersistenceError.message) {
        redirectUrl.searchParams.set("persistence_detail", storePersistenceError.message.slice(0, 180));
      }

      return NextResponse.redirect(redirectUrl);
    }

    let scriptAssociationAttempted = false;

    try {
      const association = await associateManualScriptToStore(token.user_id, token.access_token);
      scriptAssociationAttempted = Boolean(association);
    } catch (scriptError) {
      logger.warn("Script association failed after OAuth callback", {
        error: scriptError,
        storeId: token.user_id,
      });
    }

    redirectUrl.searchParams.set("connected", "1");
    redirectUrl.searchParams.set("store_id", store.tiendanubeId);
    if (scriptAssociationAttempted) {
      redirectUrl.searchParams.set("script", "associated");
    }

    const response = NextResponse.redirect(redirectUrl);
    const sessionValue = await buildSignedSessionValue(store.tiendanubeId, clientSecret);

    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 12,
      name: ADMIN_SESSION_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: sessionValue,
    });
    response.cookies.delete(OAUTH_STATE_COOKIE);

    logger.info("Store installation persisted successfully", {
      scope: token.scope,
      storeId: token.user_id,
    });

    return response;
  } catch (callbackError) {
    logger.error("OAuth callback failed while exchanging authorization code", {
      error: callbackError,
      hasCode: Boolean(code),
    });
    redirectUrl.searchParams.set("error", "token_exchange_failed");

    if (callbackError instanceof TiendaNubeApiError) {
      redirectUrl.searchParams.set("auth_status", String(callbackError.status));

      const responseMessage =
        callbackError.body?.description ??
        callbackError.body?.message ??
        callbackError.message;

      if (responseMessage) {
        redirectUrl.searchParams.set("auth_detail", responseMessage.slice(0, 180));
      }
    }

    return NextResponse.redirect(redirectUrl);
  }
}
