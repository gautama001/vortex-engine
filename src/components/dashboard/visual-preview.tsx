"use client";

import { useMemo } from "react";
import { Eye, LayoutTemplate } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  MerchantPreviewProduct,
  MerchantStorefrontContext,
  MerchantWidgetConfig,
} from "@/components/dashboard/types";

type VisualPreviewProps = {
  config: MerchantWidgetConfig;
  products: MerchantPreviewProduct[];
  storefront: MerchantStorefrontContext | null;
};

const getContrastTextColor = (hexColor: string): string => {
  const normalized = hexColor.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized
        .split("")
        .map((character) => character + character)
        .join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return "#08131f";
  }

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  const luminance = red * 0.299 + green * 0.587 + blue * 0.114;

  return luminance > 176 ? "#08131f" : "#f8fafc";
};

const resolveFontStack = (fontFamily: MerchantWidgetConfig["fontFamily"]): string => {
  switch (fontFamily) {
    case "editorial-serif":
      return '"Cormorant Garamond", "Iowan Old Style", "Times New Roman", serif';
    case "ui-sans":
      return 'Inter, "Segoe UI", Arial, sans-serif';
    case "plex-sans":
    default:
      return '"IBM Plex Sans", "Segoe UI", Arial, sans-serif';
  }
};

const formatMoney = (value: number | null, currencyCode: string | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Ver detalle";
  }

  try {
    return new Intl.NumberFormat("es-AR", {
      currency: currencyCode || "ARS",
      style: "currency",
    }).format(value);
  } catch {
    return `$${value}`;
  }
};

const getDiscountedPrice = (
  value: number | null,
  discountPercentage: MerchantWidgetConfig["discountPercentage"],
): number | null => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  if (!discountPercentage) {
    return value;
  }

  return Math.max(0, value * (1 - discountPercentage / 100));
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const buildPreviewDocument = (
  config: MerchantWidgetConfig,
  products: MerchantPreviewProduct[],
  storefront: MerchantStorefrontContext | null,
  viewport: "desktop" | "mobile",
): string => {
  const heroProduct = products[0] ?? null;
  const recommendedProducts = products.slice(1, config.recommendationLimit + 1);
  const currencyCode = storefront?.currencyCode ?? "ARS";
  const strategyLabel =
    config.recommendationAlgorithm === "comprados-juntos"
      ? "Comprados juntos (FBT)"
      : config.recommendationAlgorithm === "seleccion-manual"
        ? "Seleccion manual"
          : "IA Engine";
  const emptyStateCopy =
    config.recommendationAlgorithm === "seleccion-manual"
      ? "Agrega productos manuales desde el auditor para ver la grilla final del widget."
      : "Todavia no hay suficientes recomendaciones para renderizar la vista previa.";
  const fontStack = resolveFontStack(config.fontFamily);
  const actionTextColor = getContrastTextColor(config.accentColor);
  const isMobileViewport = viewport === "mobile";

  const widgetCards = recommendedProducts
    .map((product) => {
      const originalPriceLabel = formatMoney(product.price, currencyCode);
      const discountedPriceLabel = formatMoney(
        getDiscountedPrice(product.price, config.discountPercentage),
        currencyCode,
      );
      const discountLabel = config.discountPercentage
        ? `${config.discountPercentage}% OFF`
        : "";

      return `
        <article class="vortex-card">
          ${
            product.imageUrl
              ? `<img class="vortex-image" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" />`
              : `<div class="vortex-image vortex-image--placeholder"></div>`
          }
          <div class="vortex-meta">
            <p class="vortex-name">${escapeHtml(product.name)}</p>
            <div class="vortex-row vortex-row--pricing">
              ${
                config.discountPercentage
                  ? `<span class="vortex-price vortex-price--original">${escapeHtml(originalPriceLabel)}</span>`
                  : `<span class="vortex-price">${escapeHtml(originalPriceLabel)}</span>`
              }
              ${
                config.discountPercentage
                  ? `<span class="vortex-price vortex-price--current">${escapeHtml(discountedPriceLabel)}</span>`
                  : ""
              }
              ${
                discountLabel
                  ? `<span class="vortex-tag">${escapeHtml(discountLabel)}</span>`
                  : ""
              }
            </div>
          </div>
          <button class="vortex-button">${escapeHtml(config.quickAddLabel)}</button>
        </article>
      `;
    })
    .join("");

  const widgetGridMarkup =
    widgetCards ||
    `
      <div class="vortex-empty">
        <p>${escapeHtml(emptyStateCopy)}</p>
      </div>
    `;

  const widgetState = config.widgetEnabled
    ? `
      <section class="vortex-widget">
        <div class="vortex-eyebrow">${escapeHtml(strategyLabel)}</div>
        <h3>${escapeHtml(config.widgetTitle)}</h3>
        <p>${escapeHtml(config.widgetSubtitle)}</p>
        <div class="vortex-grid">${widgetGridMarkup}</div>
      </section>
    `
    : `
      <section class="vortex-widget vortex-widget--disabled">
        <div class="vortex-eyebrow">Widget disabled</div>
        <h3>Storefront preview pausado</h3>
        <p>Activa el widget para ver la inyeccion dentro del storefront.</p>
      </section>
    `;
  const productWidgetMarkup = isMobileViewport
    ? ""
    : `<div class="product-widget-row">${widgetState}</div>`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          :root {
            --vortex-bg: ${config.backgroundColor};
            --vortex-accent: ${config.accentColor};
            --vortex-radius: ${config.borderRadius}px;
            --vortex-text: ${config.fontColor};
            --vortex-font: ${fontStack};
            --vortex-action-text: ${actionTextColor};
            --vortex-columns-desktop: ${config.desktopColumns};
            --vortex-columns-mobile: ${config.mobileColumns};
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: var(--vortex-font);
            color: #0f172a;
            background: linear-gradient(180deg, #f6f9fc 0%, #eef3f8 100%);
          }
          .frame {
            min-height: 100vh;
            padding: 18px;
            background:
              radial-gradient(circle at top right, rgba(88,226,243,.24), transparent 36%),
              linear-gradient(180deg, #fbfdff 0%, #eef4fa 100%);
          }
          .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 18px;
            border-radius: 22px 22px 0 0;
            background: linear-gradient(180deg, #18233a 0%, #121a2e 100%);
            color: rgba(255,255,255,.92);
          }
          .topbar__brand {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
          }
          .topbar__pulse {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: var(--vortex-accent);
            box-shadow: 0 0 0 6px rgba(88,226,243,.18);
          }
          .storefront {
            overflow: hidden;
            border-radius: 26px;
            border: 1px solid rgba(15,23,42,.08);
            box-shadow: 0 30px 60px -40px rgba(15,23,42,.25);
            background: white;
          }
          .product {
            display: grid;
            gap: 22px;
            padding: 22px;
            grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
          }
          .product-widget-row {
            padding: 0 22px 22px;
          }
          .product-image {
            width: 100%;
            min-height: 290px;
            border-radius: 24px;
            object-fit: cover;
            background: linear-gradient(180deg, #eff3f8, #dfe7f1);
          }
          .product-copy h2 {
            margin: 0;
            font-size: 28px;
            color: #0f172a;
          }
          .product-copy p {
            margin: 8px 0 0;
            color: #475569;
            line-height: 1.65;
            font-size: 14px;
          }
          .product-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
          }
          .pill {
            display: inline-flex;
            align-items: center;
            height: 28px;
            padding: 0 12px;
            border-radius: 999px;
            background: rgba(88,226,243,.16);
            color: #0f172a;
            font-size: 12px;
            font-weight: 600;
          }
          .price {
            font-size: 34px;
            font-weight: 700;
            color: #0f172a;
          }
          .ghost-btn {
            height: 46px;
            border-radius: 14px;
            border: 0;
            padding: 0 18px;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
          }
          .vortex-widget {
            margin-top: 22px;
            padding: 18px;
            border-radius: calc(var(--vortex-radius) + 4px);
            background: linear-gradient(180deg, color-mix(in srgb, var(--vortex-bg) 88%, #142235 12%), var(--vortex-bg));
            color: var(--vortex-text);
            font-family: var(--vortex-font);
          }
          .vortex-widget--disabled {
            opacity: .8;
            border: 1px dashed rgba(255,255,255,.16);
          }
          .vortex-eyebrow {
            display: inline-flex;
            align-items: center;
            height: 28px;
            padding: 0 12px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--vortex-accent) 20%, transparent);
            border: 1px solid color-mix(in srgb, var(--vortex-accent) 45%, transparent);
            color: color-mix(in srgb, white 88%, var(--vortex-accent) 12%);
            font-size: 11px;
            letter-spacing: .22em;
            text-transform: uppercase;
          }
          .vortex-widget h3 {
            margin: 14px 0 8px;
            font-size: 28px;
            line-height: 1.08;
            color: var(--vortex-text);
          }
          .vortex-widget p {
            margin: 0 0 16px;
            color: color-mix(in srgb, var(--vortex-text) 76%, transparent);
            font-size: 14px;
            line-height: 1.6;
          }
          .vortex-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(var(--vortex-columns-desktop), minmax(0, 1fr));
          }
          .frame[data-viewport="desktop"] .product {
            grid-template-columns: minmax(0, 0.84fr) minmax(0, 0.96fr);
            align-items: start;
          }
          .frame[data-viewport="desktop"] .product-image {
            min-height: 230px;
            max-height: 360px;
          }
          .frame[data-viewport="desktop"] .product-copy {
            display: grid;
            align-content: start;
            gap: 10px;
          }
          .frame[data-viewport="desktop"] .product-copy p {
            max-width: 46ch;
          }
          .frame[data-viewport="desktop"] .product-row {
            display: grid;
            justify-items: start;
            gap: 10px;
            margin-top: 6px;
          }
          .frame[data-viewport="desktop"] .vortex-grid {
            grid-template-columns: repeat(var(--vortex-columns-desktop), minmax(0, 1fr));
          }
          .frame[data-viewport="mobile"] .product {
            grid-template-columns: 1fr;
          }
          .frame[data-viewport="mobile"] .product-widget-row {
            display: none;
          }
          .frame[data-viewport="mobile"] .vortex-grid {
            grid-template-columns: repeat(var(--vortex-columns-mobile), minmax(0, 1fr));
          }
          .vortex-empty {
            grid-column: 1 / -1;
            padding: 20px;
            border-radius: calc(var(--vortex-radius) - 4px);
            border: 1px dashed rgba(255,255,255,.12);
            background: rgba(255,255,255,.04);
          }
          .vortex-empty p {
            margin: 0;
            color: color-mix(in srgb, var(--vortex-text) 82%, transparent);
          }
          .vortex-card {
            padding: 12px;
            border-radius: var(--vortex-radius);
            background: rgba(255,255,255,.05);
            border: 1px solid rgba(255,255,255,.08);
            min-height: 100%;
          }
          .vortex-image {
            width: 100%;
            aspect-ratio: 0.76 / 1.14;
            border-radius: calc(var(--vortex-radius) - 8px);
            object-fit: cover;
            object-position: center top;
            background: rgba(255,255,255,.06);
          }
          .vortex-image--placeholder {
            background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          }
          .vortex-meta {
            margin-top: 10px;
          }
          .vortex-name {
            margin: 0;
            font-size: 13px;
            font-weight: 600;
            color: var(--vortex-text);
          }
          .vortex-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 8px;
            font-size: 12px;
            color: color-mix(in srgb, var(--vortex-text) 72%, transparent);
            flex-wrap: wrap;
          }
          .vortex-row--pricing {
            justify-content: space-between;
            gap: 8px 14px;
          }
          .vortex-price {
            color: color-mix(in srgb, var(--vortex-text) 82%, transparent);
            font-variant-numeric: tabular-nums;
          }
          .vortex-price--original {
            text-decoration: line-through;
            opacity: .72;
          }
          .vortex-price--current {
            color: var(--vortex-text);
            font-weight: 700;
          }
          .vortex-tag {
            margin-left: auto;
            color: color-mix(in srgb, var(--vortex-text) 12%, var(--vortex-accent) 88%);
            font-weight: 700;
            text-transform: uppercase;
          }
          .vortex-button {
            width: 100%;
            margin-top: 12px;
            height: 38px;
            border: 0;
            border-radius: 999px;
            background: var(--vortex-accent);
            color: var(--vortex-action-text);
            font-weight: 700;
            font-family: var(--vortex-font);
          }
          @media (max-width: 720px) {
            .product {
              grid-template-columns: 1fr;
            }
            .product-widget-row {
              display: none;
            }
            .vortex-grid {
              grid-template-columns: repeat(var(--vortex-columns-mobile), minmax(0, 1fr));
            }
            .vortex-image {
              aspect-ratio: 0.74 / 1.24;
            }
          }
        </style>
      </head>
      <body>
        <div class="frame" data-viewport="${isMobileViewport ? "mobile" : "desktop"}">
          <div class="storefront">
        <div class="topbar">
          <div class="topbar__brand">
            <span class="topbar__pulse"></span>
            <span>${escapeHtml(storefront?.name ?? "tiendanube")}</span>
          </div>
          <span>Preview merchant</span>
        </div>
            <div class="product">
              ${
                heroProduct?.imageUrl
                  ? `<img class="product-image" src="${escapeHtml(heroProduct.imageUrl)}" alt="${escapeHtml(heroProduct.name)}" />`
                  : `<div class="product-image"></div>`
              }
              <div class="product-copy">
                <div class="pill">Pagina de producto</div>
                <h2>${escapeHtml(heroProduct?.name ?? "Apollo Sneakers")}</h2>
                <p>
                  Preview aislado del storefront para validar branding, copy y placement antes de
                  publicar en TiendaNube.
                </p>
                <div class="product-row">
                  <span class="price">${escapeHtml(
                    formatMoney(heroProduct?.price ?? null, currencyCode),
                  )}</span>
                  <button class="ghost-btn">Agregar al carrito</button>
                </div>
                ${isMobileViewport ? widgetState : ""}
              </div>
            </div>
            ${productWidgetMarkup}
          </div>
        </div>
      </body>
    </html>
  `;
};

export const VisualPreview = ({ config, products, storefront }: VisualPreviewProps) => {
  const previewDocument = useMemo(() => {
    return buildPreviewDocument(config, products, storefront, "desktop");
  }, [config, products, storefront]);
  const mobilePreviewDocument = useMemo(() => {
    return buildPreviewDocument(config, products, storefront, "mobile");
  }, [config, products, storefront]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100">
            <Eye className="h-3.5 w-3.5" />
            Vista previa
          </div>
          <CardTitle className="text-2xl">Simulacion de storefront</CardTitle>
          <CardDescription>
            Vista encapsulada en iframe para que el widget se vea como en produccion, sin CSS del
            dashboard contaminando el render.
          </CardDescription>
        </div>
        <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-slate-400 lg:block">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-cyan-300" />
            Preview aislado
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_380px] 2xl:grid-cols-[minmax(0,1.24fr)_420px]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/50 p-3 shadow-[0_30px_80px_-50px_rgba(88,226,243,0.35)]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-medium text-white">Preview desktop</p>
                <p className="text-xs text-slate-400">
                  {config.desktopColumns} columnas activas para storefront desktop.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Desktop
              </div>
            </div>
            <iframe
              className="h-[720px] w-full rounded-[22px] bg-white xl:h-[820px] min-[1950px]:h-[940px]"
              sandbox="allow-same-origin"
              srcDoc={previewDocument}
              title="Vortex storefront preview desktop"
            />
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/50 p-3 shadow-[0_30px_80px_-50px_rgba(88,226,243,0.24)]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-medium text-white">Preview mobile</p>
                <p className="text-xs text-slate-400">
                  {config.mobileColumns} columnas activas para storefront mobile.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Mobile
              </div>
            </div>
            <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[30px] border border-white/10 bg-[#02050a] p-2 2xl:max-w-[420px]">
              <iframe
                className="h-[760px] w-full rounded-[24px] bg-white 2xl:h-[820px]"
                sandbox="allow-same-origin"
                srcDoc={mobilePreviewDocument}
                title="Vortex storefront preview mobile"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
