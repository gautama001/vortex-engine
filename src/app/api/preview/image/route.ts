import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=900, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const rawSource = request.nextUrl.searchParams.get("src");

  if (!rawSource) {
    return NextResponse.json(
      { error: "missing_src", message: "Necesitamos una imagen remota para construir la preview." },
      { status: 400 },
    );
  }

  try {
    const source = new URL(rawSource);

    if (!["http:", "https:"].includes(source.protocol)) {
      throw new Error("Solo aceptamos imagenes publicas en http o https.");
    }

    await assertPublicHost(source.hostname);

    const response = await fetch(source, {
      cache: "no-store",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "Vortex Engine Preview Image (+https://vortexai.com.ar)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`La imagen remota respondio con estado ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.startsWith("image/")) {
      throw new Error("La URL no devolvio una imagen valida.");
    }

    const bytes = await response.arrayBuffer();

    return new NextResponse(bytes, {
      headers: {
        ...CACHE_HEADERS,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "preview_image_unavailable",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos cargar la imagen remota para la preview.",
      },
      { status: 400 },
    );
  }
}

async function assertPublicHost(hostname: string) {
  const host = hostname.trim().toLowerCase();

  if (!host || host === "localhost" || host.endsWith(".local")) {
    throw new Error("Necesitamos un host publico para la imagen de preview.");
  }

  if (isIP(host)) {
    if (!isPublicIp(host)) {
      throw new Error("La imagen no puede venir de una IP privada o reservada.");
    }
    return;
  }

  const records = await lookup(host, { all: true });

  if (!records.length) {
    throw new Error("No pudimos resolver el host de la imagen.");
  }

  if (!records.every((record) => isPublicIp(record.address))) {
    throw new Error("La imagen no puede venir de un host interno o privado.");
  }
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
