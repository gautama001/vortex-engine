import { getTiendaNubeConfig } from "@/lib/env";
import { TiendaNubeClient } from "@/lib/tiendanube/client";
import {
  type TiendaNubeOauthTokenResponse,
  type TiendaNubeScriptAssociation,
  TiendaNubeApiError,
} from "@/lib/tiendanube/types";

const sanitizeStoreDomain = (value: string): string => {
  const normalized = value.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) {
    throw new Error("Invalid TiendaNube store domain");
  }

  return normalized;
};

const safeParseJson = (value: string): Record<string, unknown> | TiendaNubeOauthTokenResponse | null => {
  try {
    return JSON.parse(value) as Record<string, unknown> | TiendaNubeOauthTokenResponse;
  } catch {
    return null;
  }
};

type TiendaNubeOauthTokenResponseRaw = Omit<TiendaNubeOauthTokenResponse, "user_id"> & {
  user_id: number | string;
};

const isOauthTokenResponse = (
  value: Record<string, unknown> | TiendaNubeOauthTokenResponseRaw,
): value is TiendaNubeOauthTokenResponseRaw => {
  return (
    "access_token" in value &&
    "scope" in value &&
    "token_type" in value &&
    "user_id" in value &&
    typeof value.access_token === "string" &&
    typeof value.scope === "string" &&
    typeof value.token_type === "string" &&
    (typeof value.user_id === "string" || typeof value.user_id === "number")
  );
};

export const buildInstallUrl = (storeDomain?: string | null, state?: string): string => {
  const { appId, authBaseUrl } = getTiendaNubeConfig();
  const baseUrl = storeDomain ? `https://${sanitizeStoreDomain(storeDomain)}` : authBaseUrl;
  const pathname = storeDomain ? `/admin/apps/${appId}/authorize` : `/apps/${appId}/authorize`;
  const url = new URL(pathname, baseUrl);

  if (state) {
    url.searchParams.set("state", state);
  }

  return url.toString();
};

export const exchangeAuthorizationCode = async (
  code: string,
): Promise<TiendaNubeOauthTokenResponse> => {
  const { appId, authBaseUrl, clientSecret } = getTiendaNubeConfig();
  const response = await fetch(new URL("/apps/authorize/token", authBaseUrl), {
    body: JSON.stringify({
      client_id: appId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const rawBody = await response.text();
  const parsedBody = rawBody ? safeParseJson(rawBody) : null;

  if (!response.ok || !parsedBody || typeof parsedBody !== "object" || !isOauthTokenResponse(parsedBody)) {
    throw new TiendaNubeApiError(
      "Unable to exchange authorization code",
      response.status,
      parsedBody && typeof parsedBody === "object" ? parsedBody : undefined,
    );
  }

  return {
    ...parsedBody,
    user_id: String(parsedBody.user_id),
  };
};

export const associateManualScriptToStore = async (
  storeId: string,
  accessToken: string,
): Promise<TiendaNubeScriptAssociation | null> => {
  const { scriptId } = getTiendaNubeConfig();

  if (!scriptId) {
    return null;
  }

  const client = new TiendaNubeClient({
    accessToken,
    storeId,
  });

  return client.post<TiendaNubeScriptAssociation, { query_params: string; script_id: number }>(
    "/scripts",
    {
      query_params: "{}",
      script_id: scriptId,
    },
  );
};
