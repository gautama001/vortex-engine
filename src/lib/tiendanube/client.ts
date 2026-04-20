import { getTiendaNubeConfig } from "@/lib/env";
import { logger } from "@/lib/logger";
import { TiendaNubeApiError } from "@/lib/tiendanube/types";

type QueryValue = boolean | number | string | null | undefined;

type QueryRecord = Record<string, QueryValue | QueryValue[]>;

type TiendaNubeClientOptions = {
  accessToken: string;
  storeId: string;
};

type JsonBody = BodyInit | null | Record<string, unknown> | unknown[] | undefined;

const normalizeQueryValue = (value: QueryValue): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
};

const safeParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

export class TiendaNubeClient {
  private readonly accessToken: string;
  private readonly storeId: string;

  constructor(options: TiendaNubeClientOptions) {
    this.accessToken = options.accessToken;
    this.storeId = options.storeId;
  }

  private buildUrl(pathname: string, query?: QueryRecord): string {
    const { apiBaseUrl, apiVersion } = getTiendaNubeConfig();
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const url = new URL(`${apiBaseUrl}/${apiVersion}/${this.storeId}${normalizedPath}`);

    if (!query) {
      return url.toString();
    }

    for (const [key, rawValue] of Object.entries(query)) {
      if (Array.isArray(rawValue)) {
        for (const item of rawValue) {
          const normalizedValue = normalizeQueryValue(item);

          if (normalizedValue !== null) {
            url.searchParams.append(key, normalizedValue);
          }
        }

        continue;
      }

      const normalizedValue = normalizeQueryValue(rawValue);

      if (normalizedValue !== null) {
        url.searchParams.set(key, normalizedValue);
      }
    }

    return url.toString();
  }

  private buildHeaders(initHeaders?: HeadersInit): Headers {
    const { partnerUserAgent } = getTiendaNubeConfig();
    const headers = new Headers(initHeaders);

    headers.set("Accept", "application/json");
    headers.set("Authentication", `bearer ${this.accessToken}`);
    headers.set("User-Agent", partnerUserAgent);

    return headers;
  }

  private buildBody(body: JsonBody): BodyInit | null | undefined {
    if (body === undefined) {
      return undefined;
    }

    if (body === null) {
      return null;
    }

    if (
      typeof body === "string" ||
      body instanceof ArrayBuffer ||
      body instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof ReadableStream
    ) {
      return body;
    }

    return JSON.stringify(body);
  }

  private buildJsonHeaders(
    body: JsonBody,
    initHeaders?: HeadersInit,
  ): HeadersInit | undefined {
    if (body === undefined || body === null) {
      return initHeaders;
    }

    if (
      typeof body === "string" ||
      body instanceof ArrayBuffer ||
      body instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof ReadableStream
    ) {
      return initHeaders;
    }

    return {
      ...Object.fromEntries(new Headers(initHeaders).entries()),
      "Content-Type": "application/json",
    };
  }

  private send<TResponse>(
    method: "DELETE" | "PATCH" | "POST" | "PUT",
    pathname: string,
    body?: JsonBody,
    query?: QueryRecord,
  ): Promise<TResponse> {
    return this.request<TResponse>(
      pathname,
      {
        body: this.buildBody(body),
        headers: this.buildJsonHeaders(body),
        method,
      },
      query,
    );
  }

  async request<TResponse>(
    pathname: string,
    init?: RequestInit,
    query?: QueryRecord,
  ): Promise<TResponse> {
    const url = this.buildUrl(pathname, query);
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: this.buildHeaders(init?.headers),
    });
    const rawBody = await response.text();
    const parsedBody = rawBody ? safeParseJson(rawBody) : null;

    if (!response.ok) {
      logger.warn("TiendaNube API request failed", {
        pathname,
        status: response.status,
        storeId: this.storeId,
      });

      throw new TiendaNubeApiError(
        `TiendaNube request failed with status ${response.status}`,
        response.status,
        parsedBody && typeof parsedBody === "object" ? (parsedBody as Record<string, unknown>) : undefined,
      );
    }

    return parsedBody as TResponse;
  }

  get<TResponse>(pathname: string, query?: QueryRecord): Promise<TResponse> {
    return this.request<TResponse>(pathname, { method: "GET" }, query);
  }

  post<TResponse, TBody extends Record<string, unknown>>(
    pathname: string,
    body: TBody,
  ): Promise<TResponse> {
    return this.send<TResponse>("POST", pathname, body);
  }

  put<TResponse, TBody extends Record<string, unknown> | unknown[]>(
    pathname: string,
    body: TBody,
  ): Promise<TResponse> {
    return this.send<TResponse>("PUT", pathname, body);
  }

  patch<TResponse, TBody extends Record<string, unknown> | unknown[]>(
    pathname: string,
    body: TBody,
  ): Promise<TResponse> {
    return this.send<TResponse>("PATCH", pathname, body);
  }

  delete<TResponse>(
    pathname: string,
    options?: {
      body?: JsonBody;
      query?: QueryRecord;
    },
  ): Promise<TResponse> {
    return this.send<TResponse>("DELETE", pathname, options?.body, options?.query);
  }
}
