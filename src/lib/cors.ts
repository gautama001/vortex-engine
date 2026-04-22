type StorefrontCorsOptions = {
  allowHeaders?: string;
  allowMethods: string;
  cacheControl: string;
  contentType?: string;
};

const isAllowedProtocol = (protocol: string): boolean => {
  if (protocol === "https:") {
    return true;
  }

  return process.env.NODE_ENV !== "production" && protocol === "http:";
};

const resolveCorsOrigin = (request: Request): string | null => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  try {
    const parsedOrigin = new URL(origin);

    if (!isAllowedProtocol(parsedOrigin.protocol)) {
      return null;
    }

    return parsedOrigin.origin;
  } catch {
    return null;
  }
};

export const buildStorefrontCorsHeaders = (
  request: Request,
  options: StorefrontCorsOptions,
): Headers => {
  const headers = new Headers({
    "Access-Control-Allow-Headers": options.allowHeaders ?? "Content-Type",
    "Access-Control-Allow-Methods": options.allowMethods,
    "Access-Control-Max-Age": "600",
    "Cache-Control": options.cacheControl,
  });
  const origin = resolveCorsOrigin(request);

  if (options.contentType) {
    headers.set("Content-Type", options.contentType);
  }

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  return headers;
};
