type TiendaNubeConfig = {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  apiVersion: string;
  appId: string;
  appUrl: string;
  authBaseUrl: string;
  clientSecret: string;
  partnerUserAgent: string;
  scriptId: number | null;
  scopes: string;
};

const required = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const optional = (key: string, fallback: string): string => {
  return process.env[key] ?? fallback;
};

const optionalNumber = (key: string, fallback: number, min: number, max: number): number => {
  const rawValue = process.env[key];
  const parsedValue = rawValue ? Number(rawValue) : fallback;

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.min(Math.max(parsedValue, min), max);
};

export const hasCoreEnvironment = (): boolean => {
  return Boolean(
    process.env.DATABASE_URL &&
      process.env.TIENDANUBE_APP_ID &&
      process.env.TIENDANUBE_CLIENT_SECRET &&
      process.env.TIENDANUBE_APP_URL,
  );
};

export const getDefaultRecommendationLimit = (): number => {
  const rawValue = process.env.VORTEX_DEFAULT_LIMIT ?? "4";
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 4;
  }

  return Math.min(parsedValue, 8);
};

export const getTiendaNubeConfig = (): TiendaNubeConfig => {
  const rawScriptId = process.env.TIENDANUBE_SCRIPT_ID;
  const parsedScriptId = rawScriptId ? Number(rawScriptId) : null;

  return {
    apiBaseUrl: optional("TIENDANUBE_API_BASE_URL", "https://api.tiendanube.com"),
    apiTimeoutMs: optionalNumber("TIENDANUBE_API_TIMEOUT_MS", 4500, 1000, 15000),
    apiVersion: optional("TIENDANUBE_API_VERSION", "2025-03"),
    appId: required("TIENDANUBE_APP_ID"),
    appUrl: required("TIENDANUBE_APP_URL").replace(/\/+$/, ""),
    authBaseUrl: optional("TIENDANUBE_AUTH_BASE_URL", "https://www.tiendanube.com"),
    clientSecret: required("TIENDANUBE_CLIENT_SECRET"),
    partnerUserAgent: optional(
      "TIENDANUBE_PARTNER_USER_AGENT",
      "Vortex Engine (team@vortex.engine)",
    ),
    scriptId: Number.isFinite(parsedScriptId) ? parsedScriptId : null,
    scopes: optional("TIENDANUBE_SCOPES", "read_products,write_scripts"),
  };
};
