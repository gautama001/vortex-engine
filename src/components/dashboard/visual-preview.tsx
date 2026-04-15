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
): string => {
  const heroProduct = products[0] ?? null;
  const recommendedProducts =
    products.slice(1, config.recommendationLimit + 1).length > 0
      ? products.slice(1, config.recommendationLimit + 1)
      : products.slice(0, config.recommendationLimit);
  const currencyCode = storefront?.currencyCode ?? "ARS";

  const widgetCards = recommendedProducts
    .map((product) => {
      return `
        <article class="vortex-card">
          ${
            product.imageUrl
              ? `<img class="vortex-image" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" />`
              : `<div class="vortex-image vortex-image--placeholder"></div>`
          }
          <div class="vortex-meta">
            <p class="vortex-name">${escapeHtml(product.name)}</p>
            <div class="vortex-row">
              <span>${escapeHtml(formatMoney(product.price, currencyCode))}</span>
              <span class="vortex-tag">bundle fit</span>
            </div>
          </div>
          <button class="vortex-button">${escapeHtml(config.quickAddLabel)}</button>
        </article>
      `;
    })
    .join("");

  const widgetState = config.widgetEnabled
    ? `
      <section class="vortex-widget">
        <div class="vortex-eyebrow">Combine and Save</div>
        <h3>${escapeHtml(config.widgetTitle)}</h3>
        <p>${escapeHtml(config.widgetSubtitle)}</p>
        <div class="vortex-grid">${widgetCards}</div>
      </section>
    `
    : `
      <section class="vortex-widget vortex-widget--disabled">
        <div class="vortex-eyebrow">Widget disabled</div>
        <h3>Storefront preview pausado</h3>
        <p>Activa el widget para ver la inyeccion dentro del storefront.</p>
      </section>
    `;

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
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "IBM Plex Sans", "Segoe UI", Arial, sans-serif;
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
            color: rgba(255,255,255,.96);
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
          }
          .vortex-widget p {
            margin: 0 0 16px;
            color: rgba(226,232,240,.78);
            font-size: 14px;
            line-height: 1.6;
          }
          .vortex-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(${Math.max(2, Math.min(config.recommendationLimit, 4))}, minmax(0, 1fr));
          }
          .vortex-card {
            padding: 12px;
            border-radius: var(--vortex-radius);
            background: rgba(255,255,255,.05);
            border: 1px solid rgba(255,255,255,.08);
          }
          .vortex-image {
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: calc(var(--vortex-radius) - 8px);
            object-fit: cover;
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
            color: white;
          }
          .vortex-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 8px;
            font-size: 12px;
            color: rgba(226,232,240,.72);
          }
          .vortex-tag {
            color: color-mix(in srgb, white 68%, var(--vortex-accent) 32%);
            text-transform: lowercase;
          }
          .vortex-button {
            width: 100%;
            margin-top: 12px;
            height: 38px;
            border: 0;
            border-radius: 999px;
            background: var(--vortex-accent);
            color: #08131f;
            font-weight: 700;
          }
          @media (max-width: 900px) {
            .product {
              grid-template-columns: 1fr;
            }
            .vortex-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
        </style>
      </head>
      <body>
        <div class="frame">
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
                ${widgetState}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const VisualPreview = ({ config, products, storefront }: VisualPreviewProps) => {
  const previewDocument = useMemo(() => {
    return buildPreviewDocument(config, products, storefront);
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
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/50 p-3 shadow-[0_30px_80px_-50px_rgba(88,226,243,0.35)]">
          <iframe
            className="h-[780px] w-full rounded-[22px] bg-white xl:h-[900px] 2xl:h-[980px]"
            sandbox="allow-same-origin"
            srcDoc={previewDocument}
            title="Vortex storefront preview"
          />
        </div>
      </CardContent>
    </Card>
  );
};
