"use client";

import { useMemo, useRef, useState } from "react";

type EngineMode = "IA" | "FBT" | "Manual";

type LivePreviewProduct = {
  image: string;
  name: string;
  price: string;
  url: string;
};

type PreviewProduct = {
  badge: string;
  image?: string;
  name: string;
  price: string;
  subtitle: string;
  url?: string;
};

type PreviewProfile = {
  commandCenterBadge: string;
  commandCenterCopy: string;
  engine: EngineMode;
  engineBullets: string[];
  installSummary: string;
  metrics: Array<{ label: string; value: string }>;
  modeTitle: string;
  opportunityTitle: string;
  placement: string;
  projectedRevenue: string;
  signalCopy: string;
  signalTitle: string;
  widgetIntro: string;
  widgetProducts: PreviewProduct[];
  widgetTitle: string;
};

const DEFAULT_INPUT = "https://mitienda.tiendanube.com";

const PROFILES: Record<EngineMode, PreviewProfile> = {
  FBT: {
    commandCenterBadge: "FBT recomendado",
    commandCenterCopy:
      "La capa FBT calza mejor cuando la tienda ya vende looks, combinaciones y productos de alta intencion de compra.",
    engine: "FBT",
    engineBullets: [
      "Combos de compra conjunta y secuencias de carrito para subir ticket sin ensuciar marca.",
      "Ideal para calzado, moda y categorias con accesorios o pares complementarios.",
      "Mantiene el storefront liviano y hace visible el bundle correcto en el momento correcto.",
    ],
    installSummary:
      "La instalacion sugerida activa recomendaciones de carrito, combinaciones frecuentes y quick add sobre productos relacionados.",
    metrics: [
      { label: "Revenue lift", value: "+11.8%" },
      { label: "AOV boost", value: "+9.2%" },
      { label: "Recomendaciones", value: "12" },
    ],
    modeTitle: "Preview / FBT recomendado",
    opportunityTitle:
      "Hay una oportunidad clara de compra conjunta y ticket incremental sin tocar checkout.",
    placement: "Carrito / bundle contextual",
    projectedRevenue: "$1.392.800 / mes",
    signalCopy:
      "La demo sugiere un bloque de combinacion de look con quick add para capturar ticket incremental sin tocar checkout ni rearmar todo el storefront.",
    signalTitle: "FBT recomendado para esta tienda",
    widgetIntro:
      "La preview intenta traer 2 productos publicos del storefront y aplica sobre ellos una capa FBT pensada para quick add.",
    widgetProducts: [
      {
        badge: "01",
        name: "Comprados juntos",
        price: "$34.700",
        subtitle: "Bundle / Cross-sell",
      },
      {
        badge: "02",
        name: "Upsell de carrito",
        price: "$37.900",
        subtitle: "Ticket incremental",
      },
    ],
    widgetTitle: "Comprados juntos",
  },
  IA: {
    commandCenterBadge: "IA recomendado",
    commandCenterCopy:
      "La preview ordena afinidad, densidad de categoria y contexto visual para modelar donde Vortex capturaria mejor crecimiento incremental.",
    engine: "IA",
    engineBullets: [
      "Afinidad semantica sobre tags, categoria y momento comercial.",
      "Fallback inteligente cuando la tienda todavia no tiene suficiente senal historica.",
      "Prioridad para productos con mejor combinacion de contexto, margen y oportunidad visual.",
    ],
    installSummary:
      "La preview ya muestra oportunidad, algoritmo y dashboard real. El paso natural ahora es activar una instalacion simple con impacto visible desde el primer recorrido.",
    metrics: [
      { label: "Revenue lift", value: "+14.7%" },
      { label: "AOV boost", value: "+10.5%" },
      { label: "Recomendaciones", value: "17" },
    ],
    modeTitle: "Preview / IA recomendado",
    opportunityTitle:
      "Hay una oportunidad de lift visible en producto sin necesidad de una implementacion pesada.",
    placement: "PDP / quick add contextual",
    projectedRevenue: "$1.798.496 / mes",
    signalCopy:
      "La simulacion prioriza una capa de recomendaciones clara, un placement visible y un motor que haga sentido comercial para la etapa actual de la tienda.",
    signalTitle: "IA recomendada para esta tienda",
    widgetIntro:
      "Recomendaciones activadas sobre la URL cargada para sumar AOV sin intervenir el tema completo.",
    widgetProducts: [
      {
        badge: "01",
        name: "Complemento inteligente",
        price: "$15.089",
        subtitle: "Afinidad / Quick Add",
      },
      {
        badge: "02",
        name: "Upsell contextual",
        price: "$15.106",
        subtitle: "Momento de conversion",
      },
    ],
    widgetTitle: "Completa tu look",
  },
  Manual: {
    commandCenterBadge: "Manual / curado",
    commandCenterCopy:
      "La capa manual funciona mejor cuando la marca necesita priorizar lanzamientos, editoriales o una seleccion curada por temporada.",
    engine: "Manual",
    engineBullets: [
      "Seleccion editorial para marcas que quieren controlar narrativa, drop y mix comercial.",
      "Ideal para colecciones cortas, capsulas y storefronts muy de marca.",
      "Permite usar Vortex como capa operativa sin perder criterio creativo.",
    ],
    installSummary:
      "La instalacion pone foco en una configuracion simple, curada y alineada con la narrativa visual del merchant.",
    metrics: [
      { label: "Revenue lift", value: "+8.9%" },
      { label: "AOV boost", value: "+6.4%" },
      { label: "Recomendaciones", value: "9" },
    ],
    modeTitle: "Preview / Manual recomendado",
    opportunityTitle:
      "Hay una oportunidad de merchandising curado para reforzar storytelling y aumentar conversion asistida.",
    placement: "PDP / seleccion editorial",
    projectedRevenue: "$924.300 / mes",
    signalCopy:
      "La demo recomienda una capa manual porque la tienda transmite criterio de marca, menos volumen y una necesidad mas fuerte de control creativo.",
    signalTitle: "Manual recomendado para esta tienda",
    widgetIntro:
      "La vista previa prioriza recomendaciones curadas para conservar criterio de marca y aun asi sumar conversion asistida.",
    widgetProducts: [
      {
        badge: "01",
        name: "Seleccion editorial",
        price: "$18.400",
        subtitle: "Curado / Storytelling",
      },
      {
        badge: "02",
        name: "Capsula complementaria",
        price: "$19.250",
        subtitle: "Lanzamiento / Contexto",
      },
    ],
    widgetTitle: "Seleccion curada",
  },
};

function normalizeStoreInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return DEFAULT_INPUT;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);

    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return DEFAULT_INPUT;
  }
}

function getStoreHost(value: string) {
  try {
    return new URL(normalizeStoreInput(value)).host;
  } catch {
    return "mitienda.tiendanube.com";
  }
}

function inferEngineMode(host: string): EngineMode {
  const normalized = host.toLowerCase();

  if (/(shoes|shoe|zapa|zapat|zapato|calzado|sneaker|boot|borcego|sandalia)/.test(normalized)) {
    return "FBT";
  }

  if (/(atelier|capsule|capsula|editorial|deco|decor|home|design|concept)/.test(normalized)) {
    return "Manual";
  }

  return "IA";
}

function buildInstallHref(storeInput: string) {
  return `/api/auth/install?store_domain=${encodeURIComponent(normalizeStoreInput(storeInput))}`;
}

function getProductSubtitle(mode: EngineMode, index: number) {
  const subtitles: Record<EngineMode, string[]> = {
    FBT: ["Cross-sell / Compra conjunta", "Bundle / Ticket incremental"],
    IA: ["Afinidad / Quick Add", "Momento de conversion"],
    Manual: ["Curado / Storytelling", "Merchandising / Prioridad"],
  };

  return subtitles[mode][index] ?? "Recomendacion / Vortex";
}

function hydrateWidgetProducts(
  mode: EngineMode,
  liveProducts: LivePreviewProduct[] | null,
  fallbackProducts: PreviewProduct[],
) {
  if (!liveProducts?.length) {
    return fallbackProducts;
  }

  return liveProducts.slice(0, 2).map((product, index) => ({
    badge: String(index + 1).padStart(2, "0"),
    image: product.image,
    name: product.name,
    price: product.price,
    subtitle: getProductSubtitle(mode, index),
    url: product.url,
  }));
}

function getStatusCopy({
  host,
  liveProducts,
  mode,
}: {
  host: string;
  liveProducts: LivePreviewProduct[] | null;
  mode: EngineMode;
}) {
  if (liveProducts?.length) {
    return `Preview lista para ${host}. Detectamos ${liveProducts.length} productos publicos y recomendamos ${mode}.`;
  }

  return `Preview lista para ${host}. No encontramos productos publicos claros, asi que dejamos una simulacion ${mode} liviana.`;
}

function getPreviewActionLabel(product: PreviewProduct) {
  return product.url ? "Ver producto" : "Ver demo";
}

export function LandingPreviewExperience() {
  const requestIdRef = useRef(0);
  const [draftValue, setDraftValue] = useState(DEFAULT_INPUT);
  const [storeInput, setStoreInput] = useState(DEFAULT_INPUT);
  const [selectedMode, setSelectedMode] = useState<EngineMode | null>(null);
  const [liveProducts, setLiveProducts] = useState<LivePreviewProduct[] | null>(null);
  const [previewStatus, setPreviewStatus] = useState(
    "Demo lista para modelar storefront, placement y algoritmo recomendado.",
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const previewState = useMemo(() => {
    const normalizedStore = normalizeStoreInput(storeInput);
    const host = getStoreHost(normalizedStore);
    const recommendedMode = inferEngineMode(host);
    const activeMode = selectedMode ?? recommendedMode;
    const baseProfile = PROFILES[activeMode];
    const widgetProducts = hydrateWidgetProducts(activeMode, liveProducts, baseProfile.widgetProducts);

    return {
      activeMode,
      host,
      installHref: buildInstallHref(normalizedStore),
      normalizedStore,
      profile: {
        ...baseProfile,
        modeTitle: `Preview / ${activeMode} ${activeMode === recommendedMode ? "recomendado" : "activo"}`,
        widgetIntro: liveProducts?.length
          ? `Detectamos ${liveProducts.length} productos reales en ${host} y armamos una preview ${activeMode} sobre esa seleccion.`
          : baseProfile.widgetIntro,
        widgetProducts,
      },
      recommendedMode,
    };
  }, [liveProducts, selectedMode, storeInput]);

  async function handlePreview() {
    const normalizedStore = normalizeStoreInput(draftValue);
    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    setIsPreviewLoading(true);
    setSelectedMode(null);
    setStoreInput(normalizedStore);
    setPreviewStatus("Leyendo storefront, perfilando la tienda y buscando productos publicos...");

    try {
      const response = await fetch(
        `/api/preview/storefront?store=${encodeURIComponent(normalizedStore)}`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const payload = (await response.json()) as {
        message?: string;
        products?: LivePreviewProduct[];
      };

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message ?? "No pudimos preparar la preview.");
      }

      const products = Array.isArray(payload.products) ? payload.products.slice(0, 2) : [];
      const host = getStoreHost(normalizedStore);
      const recommendedMode = inferEngineMode(host);

      setLiveProducts(products.length ? products : null);
      setPreviewStatus(
        getStatusCopy({
          host,
          liveProducts: products.length ? products : null,
          mode: recommendedMode,
        }),
      );
    } catch (error) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const host = getStoreHost(normalizedStore);
      const recommendedMode = inferEngineMode(host);

      setLiveProducts(null);
      setPreviewStatus(
        error instanceof Error && error.message
          ? `${error.message} Mostramos una simulacion ${recommendedMode} para ${host}.`
          : `No pudimos leer el storefront publico. Mostramos una simulacion ${recommendedMode} para ${host}.`,
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsPreviewLoading(false);
      }
    }
  }

  return (
    <>
      <section className="grid gap-8 py-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:py-12">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">
              Vortex para TiendaNube
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[5.6rem] lg:leading-[0.92]">
              Previsualiza el impacto de Vortex sobre una PDP sin meter una implementacion pesada.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Una landing comercial, una demo clara y una ruta directa a la app para mostrar
              revenue lift, placement sugerido y valor incremental sin ruido tecnico.
            </p>
          </div>

          <form
            className="grid gap-3 rounded-[32px] border border-slate-900/10 bg-white/75 p-5 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl"
            onSubmit={(event) => {
              event.preventDefault();
              void handlePreview();
            }}
          >
            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                URL de la tienda o dominio de TiendaNube
              </span>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  autoComplete="off"
                  className="h-14 rounded-full border border-slate-900/10 bg-white px-5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20"
                  onChange={(event) => setDraftValue(event.target.value)}
                  placeholder="https://mitienda.tiendanube.com"
                  type="text"
                  value={draftValue}
                />
                <button
                  className="inline-flex h-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-medium text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isPreviewLoading}
                  type="submit"
                >
                  {isPreviewLoading ? "Previsualizando..." : "Previsualizar potencial"}
                </button>
              </div>
              <span className="text-sm leading-6 text-slate-600">
                Este boton no instala nada ni te manda a TiendaNube: solo recalcula la propuesta,
                el motor sugerido y, si la tienda es publica, intenta traer productos reales para el mockup.
              </span>
            </label>

            <div className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-950">
              {previewStatus}
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
              href="#simulacion"
            >
              Ver simulacion
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:border-cyan-300/40 hover:bg-cyan-50"
              href="#widget-preview"
            >
              Ver widget demo
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:border-cyan-300/40 hover:bg-cyan-50"
              href="/app"
            >
              Abrir app
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <StatusCard
            body="La URL define el perfil de la demo y ajusta oportunidad, productos sugeridos y enfoque de recomendacion."
            label="Store detectado"
            title={previewState.host}
          />
          <StatusCard
            body="La preview cambia en tiempo real para mostrar la capa mas razonable para la tienda cargada."
            label="Modo actual"
            title={previewState.profile.modeTitle}
          />
          <StatusCard
            accent
            body={previewState.profile.signalCopy}
            label="Senal activa"
            title={previewState.profile.signalTitle}
          />
        </div>
      </section>

      <section className="grid gap-5" id="simulacion">
        <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
          <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Command center
              </p>
              <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                La demo hace visible lift, AOV y densidad de recomendaciones.
              </h2>
            </div>
            <span className="rounded-full bg-cyan-300/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-900">
              {previewState.profile.commandCenterBadge}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {previewState.profile.metrics.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-cyan-300/20 bg-linear-to-b from-cyan-200/30 via-cyan-100/60 to-transparent p-5">
            <div className="flex h-44 items-end gap-4">
              {[34, 48, 42, 62, 80, 66].map((barHeight, index) => (
                <div
                  className="flex-1 rounded-t-[999px] bg-linear-to-b from-cyan-300 to-cyan-100 shadow-[0_20px_50px_-25px_rgba(14,165,233,0.6)]"
                  key={`${barHeight}-${index}`}
                  style={{ height: `${barHeight}%` }}
                />
              ))}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">
              {previewState.profile.commandCenterCopy}
            </p>
          </div>
          </div>

          <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Motores
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Alterna entre IA, FBT y reglas manuales.
              </h3>
            </div>

            <div className="mt-5 grid gap-3">
              {(["IA", "FBT", "Manual"] as EngineMode[]).map((mode) => {
                const isActive = mode === previewState.activeMode;

                return (
                  <button
                    className={`rounded-full border px-5 py-4 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_20px_50px_-28px_rgba(14,165,233,0.75)]"
                        : "border-slate-900/10 bg-white text-slate-950 hover:border-cyan-300/40"
                    }`}
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    type="button"
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
              {previewState.profile.engineBullets.map((bullet) => (
                <li className="flex gap-3" key={bullet}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:items-stretch">
          <div className="rounded-[30px] border border-slate-900/10 bg-white/78 p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Storefront
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
              Leemos la URL y devolvemos una oportunidad clara para presentar Vortex.
            </h3>
            <dl className="mt-5 grid gap-4 text-sm text-slate-700">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Store preview
                </dt>
                <dd className="mt-1 break-all font-medium text-slate-950">{previewState.normalizedStore}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Placement sugerido
                </dt>
                <dd className="mt-1 font-medium text-slate-950">{previewState.profile.placement}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-[26px] border border-cyan-300/20 bg-slate-950 p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Oportunidad detectada
              </p>
              <p className="mt-3 text-xl font-semibold tracking-[-0.04em]">
                {previewState.profile.opportunityTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {previewState.profile.signalCopy}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SmallPanel label="Revenue proyectado" value={previewState.profile.projectedRevenue} />
                <SmallPanel label="Algoritmo sugerido" value={previewState.profile.engine} />
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_30px_90px_-60px_rgba(15,23,42,0.85)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Instalar Vortex
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              La demo sirve para validar la propuesta. La instalacion va por un flujo separado.
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {previewState.profile.installSummary}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DarkPanel
                description="Conecta la tienda, publica el script y llega al dashboard sin mezclar la simulacion con el alta real."
                title="Instalacion guiada"
              />
              <DarkPanel
                description="La app conecta setup, storefront y revenue atribuido dentro del mismo flujo operativo."
                title="Widget + dashboard + ROI"
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-medium text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200"
                href={previewState.installHref}
              >
                Instalar con esta tienda
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-6 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
                href="/app"
              >
                Abrir command center
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]" id="widget-preview">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Vista previa del widget
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          {previewState.profile.widgetTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          {previewState.profile.widgetIntro}
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {previewState.profile.widgetProducts.map((product) => (
            <article
              className="rounded-[28px] border border-white/8 bg-white/6 p-4 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.85)]"
              key={`${product.badge}-${product.name}`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-2xl bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  {product.badge}
                </span>
              </div>
              <div className="mt-4 rounded-[26px] border border-white/8 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 p-6">
                <div className="flex min-h-72 items-center justify-center rounded-[24px] border border-white/8 bg-radial from-slate-700/70 via-slate-900 to-slate-950 p-6">
                  {product.url ? (
                    <a
                      className="inline-flex h-full w-full items-center justify-center"
                      href={product.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={product.name}
                        className="h-44 w-44 rounded-[28px] object-cover shadow-[0_30px_90px_-40px_rgba(14,165,233,0.6)]"
                        height="176"
                        src={product.image || "/icon.png"}
                        width="176"
                      />
                    </a>
                  ) : (
                    <img
                      alt={product.name}
                      className="h-44 w-44 rounded-[28px] object-cover shadow-[0_30px_90px_-40px_rgba(14,165,233,0.6)]"
                      height="176"
                      src={product.image || "/icon.png"}
                      width="176"
                    />
                  )}
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    {product.url ? (
                      <a
                        className="line-clamp-2 text-xl font-semibold tracking-[-0.04em] text-white hover:text-cyan-200"
                        href={product.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {product.name}
                      </a>
                    ) : (
                      <h3 className="line-clamp-2 text-xl font-semibold tracking-[-0.04em]">{product.name}</h3>
                    )}
                    <p className="mt-1 text-sm text-slate-300">{product.subtitle}</p>
                    <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-cyan-300">
                      {product.price}
                    </p>
                  </div>
                  {product.url ? (
                    <a
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-950 transition hover:bg-cyan-200"
                      href={product.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {getPreviewActionLabel(product)}
                    </a>
                  ) : (
                    <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/70 px-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-950">
                      {getPreviewActionLabel(product)}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function StatusCard({
  accent = false,
  body,
  label,
  title,
}: {
  accent?: boolean;
  body: string;
  label: string;
  title: string;
}) {
  return (
    <div
      className={`rounded-[30px] border p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl ${
        accent
          ? "border-cyan-300/25 bg-linear-to-br from-cyan-100/75 via-white/60 to-cyan-50/70"
          : "border-slate-900/10 bg-white/78"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <h2 className="mt-3 break-words text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-cyan-300/20 bg-white p-4 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-cyan-700">{value}</p>
    </div>
  );
}

function SmallPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-cyan-200">{value}</p>
    </div>
  );
}

function DarkPanel({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/6 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
