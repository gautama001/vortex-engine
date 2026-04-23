import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PreviewProduct = {
  image: string;
  name: string;
  price: string;
  url: string;
};

const DEFAULT_HEADERS = {
  "Cache-Control": "no-store",
};

const MAX_PRODUCTS = 2;
const PREVIEW_TIMEOUT_MS = 4500;

export async function GET(request: NextRequest) {
  const rawStore = request.nextUrl.searchParams.get("store");

  if (!rawStore) {
    return NextResponse.json(
      {
        error: "missing_store",
        message: "Necesitamos una URL de tienda para generar la preview.",
      },
      {
        headers: DEFAULT_HEADERS,
        status: 400,
      },
    );
  }

  try {
    const normalizedStore = normalizeStoreUrl(rawStore);
    await assertPublicHost(normalizedStore.hostname);

    const storefrontPages = await collectStorefrontPages(normalizedStore);
    const products = await extractProducts(storefrontPages, normalizedStore.origin);

    return NextResponse.json(
      {
        products,
        store: {
          host: normalizedStore.host,
          origin: normalizedStore.origin,
        },
      },
      {
        headers: DEFAULT_HEADERS,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "preview_unavailable",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos leer el storefront publico para esta preview.",
      },
      {
        headers: DEFAULT_HEADERS,
        status: 400,
      },
    );
  }
}

function normalizeStoreUrl(value: string): URL {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Solo aceptamos storefronts publicos en http o https.");
  }

  if (url.username || url.password) {
    throw new Error("La URL de la tienda no puede incluir credenciales.");
  }

  if (url.port && !["80", "443"].includes(url.port)) {
    throw new Error("La URL de la tienda usa un puerto no soportado.");
  }

  url.hash = "";
  url.pathname = "/";
  url.search = "";

  return url;
}

async function assertPublicHost(hostname: string) {
  const host = hostname.trim().toLowerCase();

  if (!host || host === "localhost" || host.endsWith(".local")) {
    throw new Error("Necesitamos un dominio publico para generar la preview.");
  }

  if (isIP(host)) {
    if (!isPublicIp(host)) {
      throw new Error("La preview no acepta IPs privadas o reservadas.");
    }
    return;
  }

  const records = await lookup(host, { all: true });

  if (!records.length) {
    throw new Error("No pudimos resolver el dominio de esa tienda.");
  }

  if (!records.every((record) => isPublicIp(record.address))) {
    throw new Error("La preview no acepta hosts internos o privados.");
  }
}

async function collectStorefrontPages(url: URL) {
  const candidates = [url.toString(), new URL("/productos/", url).toString()];
  const html = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        return await fetchHtml(candidate);
      } catch {
        return "";
      }
    }),
  );

  return html.filter(Boolean);
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Vortex Engine Preview (+https://vortexai.com.ar)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`La tienda respondio con estado ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    throw new Error("La URL no devolvio un storefront HTML valido.");
  }

  return response.text();
}

async function extractProducts(htmlPages: string[], baseOrigin: string): Promise<PreviewProduct[]> {
  const products: PreviewProduct[] = [];
  const seen = new Set<string>();
  const candidates: Array<{
    fallbackImage: string;
    fallbackName: string;
    fallbackPrice: string;
    url: string;
  }> = [];

  for (const html of htmlPages) {
    const storefrontCards = extractStorefrontCardCandidates(html, baseOrigin);

    for (const candidate of storefrontCards) {
      if (candidates.length >= MAX_PRODUCTS) {
        break;
      }

      if (!candidate.url || seen.has(candidate.url) || !candidate.fallbackName || !candidate.fallbackPrice) {
        continue;
      }

      seen.add(candidate.url);
      candidates.push(candidate);
    }

    if (candidates.length >= MAX_PRODUCTS) {
      break;
    }

    const hrefRegex = /href=(["'])([^"'<>]*\/productos\/[^"'<>]*)\1/gi;
    let match: RegExpExecArray | null = null;

    while ((match = hrefRegex.exec(html)) && products.length < MAX_PRODUCTS) {
      const hrefCandidate = match[2] ?? "";
      const href = resolveUrl(hrefCandidate, baseOrigin);

      if (!href || seen.has(href)) {
        continue;
      }

      const context = html.slice(Math.max(0, match.index - 350), Math.min(html.length, match.index + 2800));
      const name = extractName(context);
      const price = extractPrice(context);
      const image = extractImage(context, baseOrigin);

      if (!name || !price) {
        continue;
      }

      seen.add(href);
      candidates.push({
        fallbackImage: image,
        fallbackName: name,
        fallbackPrice: price,
        url: href,
      });
    }

    if (candidates.length >= MAX_PRODUCTS) {
      break;
    }
  }

  const hydrated = await Promise.all(
    candidates.slice(0, MAX_PRODUCTS).map(async (candidate) => {
      const details = await fetchProductDetails(candidate.url, baseOrigin);

      return {
        image: candidate.fallbackImage || details.image,
        name: details.name || candidate.fallbackName,
        price: details.price || candidate.fallbackPrice,
        url: candidate.url,
      };
    }),
  );

  products.push(...hydrated);

  return products;
}

function extractStorefrontCardCandidates(html: string, baseOrigin: string) {
  const candidates: Array<{
    fallbackImage: string;
    fallbackName: string;
    fallbackPrice: string;
    url: string;
  }> = [];
  const blockRegex =
    /<[^>]+data-component=(["'])product-list-item\1[\s\S]*?<\/(?:article|div|li|section)>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = blockRegex.exec(html)) && candidates.length < MAX_PRODUCTS) {
    const fragment = match[0] ?? "";
    const url = resolveUrl(
      fragment.match(/href=(["'])([^"'<>]*\/productos\/[^"'<>]*)\1/i)?.[2] ?? "",
      baseOrigin,
    );
    const fallbackName = extractName(fragment);
    const fallbackPrice = extractPrice(fragment);
    const fallbackImage = extractImage(fragment, baseOrigin);

    if (!url || !fallbackName || !fallbackPrice) {
      continue;
    }

    candidates.push({
      fallbackImage,
      fallbackName,
      fallbackPrice,
      url,
    });
  }

  return candidates;
}

async function fetchProductDetails(productUrl: string, baseOrigin: string) {
  try {
    const html = await fetchHtml(productUrl);
    const structured = extractStructuredProductData(html, baseOrigin);

    return {
      image: structured.image || extractProductPageImage(html, baseOrigin),
      name: structured.name || extractProductPageName(html),
      price: structured.price || extractProductPagePrice(html),
    };
  } catch {
    return {
      image: "",
      name: "",
      price: "",
    };
  }
}

function extractStructuredProductData(html: string, baseOrigin: string) {
  const scriptRegex = /<script[^>]*type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = scriptRegex.exec(html))) {
    const payload = cleanJsonLd(match[2] ?? "");

    if (!payload) {
      continue;
    }

    try {
      const parsed = JSON.parse(payload);
      const product = findProductNode(parsed);

      if (!product) {
        continue;
      }

      const imageSource = Array.isArray(product.image) ? product.image[0] : product.image;
      const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      const rawPrice =
        typeof offer?.price === "string" || typeof offer?.price === "number" ? String(offer.price) : "";

      return {
        image: resolveUrl(typeof imageSource === "string" ? imageSource : "", baseOrigin),
        name: cleanText(typeof product.name === "string" ? product.name : ""),
        price: rawPrice ? (rawPrice.startsWith("$") ? rawPrice : `$${rawPrice}`) : "",
      };
    } catch {
      continue;
    }
  }

  return {
    image: "",
    name: "",
    price: "",
  };
}

function extractName(fragment: string) {
  const patterns = [
    /class=(["'])[^"'<>]*(?:js-item-name|product-name|item-name|product-card-name|js-product-name)[^"'<>]*\1[^>]*>([\s\S]{1,180}?)</i,
    /<img[^>]+alt=(["'])([^"']{2,180})\1/i,
    /title=(["'])([^"']{2,180})\1/i,
  ];

  for (const pattern of patterns) {
    const match = fragment.match(pattern);
    const candidate = cleanText(match?.[2] ?? "");

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function extractPrice(fragment: string) {
  const patterns = [
    /class=(["'])[^"'<>]*(?:js-price-display|price|product-price|item-price)[^"'<>]*\1[^>]*>([\s\S]{1,120}?)</i,
    /(?:ARS\s*)?\$\s?[\d\.\,]+/i,
  ];

  for (const pattern of patterns) {
    const match = fragment.match(pattern);
    const candidate = cleanText((match?.[2] ?? match?.[0] ?? "").replace(/&nbsp;/gi, " "));

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function extractImage(fragment: string, baseOrigin: string) {
  const srcsetMatch = fragment.match(/(?:data-srcset|srcset)=(["'])([^"']+)\1/i)?.[2];

  if (srcsetMatch) {
    const bestCandidate = pickBestSrcsetCandidate(srcsetMatch);

    if (bestCandidate) {
      return resolveUrl(bestCandidate, baseOrigin);
    }
  }

  const directSource =
    fragment.match(/<meta[^>]+property=(["'])og:image\1[^>]+content=(["'])([^"']+)\2/i)?.[3] ??
    fragment.match(/(?:data-src|src)=(["'])([^"']+)\1/i)?.[2] ??
    fragment.match(/data-original=(["'])([^"']+)\1/i)?.[2] ??
    fragment.match(/data-image=(["'])([^"']+)\1/i)?.[2] ??
    fragment.match(/data-bg=(["'])([^"']+)\1/i)?.[2] ??
    "";

  return resolveUrl(directSource, baseOrigin);
}

function extractProductPageImage(html: string, baseOrigin: string) {
  const patterns = [
    /<meta[^>]+property=(["'])og:image\1[^>]+content=(["'])([^"']+)\2/i,
    /<meta[^>]+name=(["'])twitter:image\1[^>]+content=(["'])([^"']+)\2/i,
    /(?:data-image|data-zoom|data-src|src)=(["'])([^"']+)\1/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = resolveUrl(match?.[3] ?? match?.[2] ?? "", baseOrigin);

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function extractProductPageName(html: string) {
  const patterns = [
    /<meta[^>]+property=(["'])og:title\1[^>]+content=(["'])([^"']+)\2/i,
    /<h1[^>]*>([\s\S]{1,180}?)<\/h1>/i,
    /<title>([\s\S]{1,180}?)<\/title>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = cleanText(match?.[3] ?? match?.[1] ?? "");

    if (candidate) {
      return candidate.replace(/\s+\|\s+.*$/, "").trim();
    }
  }

  return "";
}

function extractProductPagePrice(html: string) {
  const patterns = [
    /<meta[^>]+property=(["'])product:price:amount\1[^>]+content=(["'])([^"']+)\2/i,
    /<meta[^>]+itemprop=(["'])price\1[^>]+content=(["'])([^"']+)\2/i,
    /(?:ARS\s*)?\$\s?[\d\.\,]+/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = cleanText((match?.[3] ?? match?.[0] ?? "").replace(/&nbsp;/gi, " "));

    if (candidate) {
      return candidate.startsWith("$") ? candidate : `$${candidate}`;
    }
  }

  return "";
}

function pickBestSrcsetCandidate(srcset: string) {
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/);
      const width = Number(descriptor?.replace(/[^\d]/g, "") ?? "0");

      return { url, width };
    })
    .sort((left, right) => right.width - left.width);

  return candidates[0]?.url ?? "";
}

function resolveUrl(value: string, baseOrigin: string) {
  if (!value) {
    return "";
  }

  const cleaned = decodeHtml(value).trim();

  try {
    return new URL(cleaned, baseOrigin).toString();
  } catch {
    return "";
  }
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/\\\//g, "/");
}

function cleanJsonLd(value: string) {
  return decodeHtml(value)
    .replace(/^\s*<!--/, "")
    .replace(/-->\s*$/, "")
    .trim();
}

function findProductNode(node: unknown): Record<string, unknown> | null {
  if (!node) {
    return null;
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProductNode(item);

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (typeof node !== "object") {
    return null;
  }

  const candidate = node as Record<string, unknown>;
  const type = candidate["@type"];

  if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
    return candidate;
  }

  if (candidate["@graph"]) {
    return findProductNode(candidate["@graph"]);
  }

  for (const value of Object.values(candidate)) {
    const found = findProductNode(value);

    if (found) {
      return found;
    }
  }

  return null;
}

function isPublicIp(ipAddress: string) {
  if (ipAddress.includes(":")) {
    const normalized = ipAddress.toLowerCase();

    return !(
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80")
    );
  }

  const octets = ipAddress.split(".").map((part) => Number(part));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }

  const a = octets[0]!;
  const b = octets[1]!;

  return !(
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}
