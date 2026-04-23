"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  engine: EngineMode;
  engineBullets: string[];
  installSummary: string;
  lead: string;
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
    engine: "FBT",
    engineBullets: [
      "Muestra productos que naturalmente se venden mejor juntos para que el carrito cierre mas alto.",
      "Funciona muy bien en moda, calzado y categorias donde el comprador suele completar un look o sumar un accesorio.",
      "Le da al merchant una forma simple de vender una segunda pieza sin complicar el storefront.",
    ],
    installSummary:
      "Activa compras conjuntas, quick add y una lectura clara del impacto en ventas cruzadas desde un panel simple de operar.",
    lead:
      "FBT ayuda a que cada carrito lleve una pieza mas: combina productos que se venden bien juntos para subir ticket sin tocar checkout.",
    metrics: [
      { label: "Suba de ticket", value: "+12.4%" },
      { label: "Ventas cruzadas", value: "+18.1%" },
      { label: "Recomendaciones", value: "12" },
    ],
    modeTitle: "Preview / FBT recomendado",
    opportunityTitle: "La tienda tiene potencial claro para vender productos juntos y aumentar ticket promedio.",
    placement: "Carrito / combinacion contextual",
    projectedRevenue: "$1.392.800 / mes",
    signalCopy:
      "Vortex sugiere una capa de productos comprados juntos para que el merchant venda mas por carrito sin sumar trabajo operativo.",
    signalTitle: "FBT recomendado para esta tienda",
    widgetIntro:
      "La demo intenta traer productos publicos del storefront y arma una propuesta de compra conjunta en tiempo real, sin sacar al merchant de esta pagina.",
    widgetProducts: [
      {
        badge: "01",
        name: "Bundle recomendado",
        price: "$34.700",
        subtitle: "Cross-sell / Compra conjunta",
      },
      {
        badge: "02",
        name: "Complemento frecuente",
        price: "$37.900",
        subtitle: "Bundle / Ticket incremental",
      },
    ],
    widgetTitle: "Comprados juntos",
  },
  IA: {
    engine: "IA",
    engineBullets: [
      "Lee afinidad visual y semantica para recomendar mejor sin depender de mucho historial de ventas.",
      "Traduce esa inteligencia en acciones claras para merchants que necesitan vender mas, no aprender otra herramienta tecnica.",
      "Ayuda a mostrar el producto correcto en el momento correcto para mejorar ticket promedio.",
    ],
    installSummary:
      "Activa recomendaciones inteligentes, branding y descuentos visibles desde un panel pensado para operar rapido y con claridad.",
    lead:
      "La capa IA ayuda a decidir que producto mostrar, donde mostrarlo y como convertir mejor cada visita en mas ticket promedio.",
    metrics: [
      { label: "Suba de ticket", value: "+14.7%" },
      { label: "Ventas cruzadas", value: "+20.6%" },
      { label: "Recomendaciones", value: "17" },
    ],
    modeTitle: "Preview / IA recomendado",
    opportunityTitle:
      "La tienda puede capturar mas valor en PDP con recomendaciones claras y una experiencia de compra mas inteligente.",
    placement: "PDP / quick add contextual",
    projectedRevenue: "$1.798.496 / mes",
    signalCopy:
      "Vortex recomienda una capa IA porque esta tienda necesita una forma simple de vender mejor sin recargar el storefront ni sumar friccion al comprador.",
    signalTitle: "IA recomendada para esta tienda",
    widgetIntro:
      "La demo intenta traer productos publicos de la tienda y convertirlos en una propuesta simple para subir AOV sin instalar nada.",
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
        subtitle: "Momento de compra",
      },
    ],
    widgetTitle: "Completa tu compra",
  },
  Manual: {
    engine: "Manual",
    engineBullets: [
      "Permite curar recomendaciones a mano cuando la marca necesita mucho control visual o editorial.",
      "Es ideal para lanzamientos, colecciones cortas o tiendas donde la identidad de marca pesa mucho en la decision.",
      "Mantiene claridad operativa sin perder control comercial ni coherencia visual.",
    ],
    installSummary:
      "Activa una capa curada para tiendas que quieren controlar exactamente que vender junto, donde y con que mensaje comercial.",
    lead:
      "La capa manual deja que el merchant conserve el control del storytelling mientras Vortex ordena branding, placement y medicion del resultado.",
    metrics: [
      { label: "Suba de ticket", value: "+8.9%" },
      { label: "Ventas cruzadas", value: "+11.3%" },
      { label: "Recomendaciones", value: "9" },
    ],
    modeTitle: "Preview / Manual recomendado",
    opportunityTitle:
      "La mejor jugada para esta tienda es una seleccion curada que respete la marca y aun asi mejore el ticket promedio.",
    placement: "PDP / seleccion editorial",
    projectedRevenue: "$924.300 / mes",
    signalCopy:
      "Vortex recomienda una capa manual para construir una propuesta mas controlada, mas clara y mejor alineada con la identidad del merchant.",
    signalTitle: "Manual recomendado para esta tienda",
    widgetIntro:
      "La vista previa usa productos publicos cuando puede y, si no, mantiene una propuesta curada lista para mostrar como vender mejor sin perder control.",
    widgetProducts: [
      {
        badge: "01",
        name: "Seleccion editorial",
        price: "$18.400",
        subtitle: "Curado / Storytelling",
      },
      {
        badge: "02",
        name: "Complemento priorizado",
        price: "$19.250",
        subtitle: "Merchandising / Prioridad",
      },
    ],
    widgetTitle: "Seleccion curada",
  },
};

const DASHBOARD_SLIDES = [
  {
    copy:
      "Desde un solo panel el merchant puede elegir si quiere automatizar con IA, empujar compras conjuntas o curar una propuesta manual segun el momento comercial de la tienda, sin depender de un perfil tecnico.",
    image: "/landing/slider-vortex-4.png",
    title: "Activa IA, FBT o una seleccion manual segun como vende tu tienda",
  },
  {
    copy:
      "La vista previa deja revisar el widget, el mensaje y los descuentos visibles antes de mover nada en la tienda en vivo, para que el merchant entienda que va a publicar y por que conviene.",
    image: "/landing/slider-vortex-5.png",
    title: "Mira como se veria en tu tienda antes de publicarlo",
  },
  {
    copy:
      "La capa financiera muestra ventas atribuidas, ganancia extra y oportunidades accionables para que Vortex se venda por resultado y no por complejidad tecnica.",
    image: "/landing/slider-vortex-6.png",
    title: "Entiende cuanto te deja de ganancia y cual es tu ROI",
  },
];

const ENGINE_LABELS: Record<EngineMode, { description: string; title: string }> = {
  FBT: {
    description: "Comprados juntos para vender una pieza mas por carrito.",
    title: "FBT / Comprados juntos",
  },
  IA: {
    description: "Automatico para recomendar segun afinidad y contexto.",
    title: "IA / Automatico",
  },
  Manual: {
    description: "Curado para tiendas que quieren mas control editorial.",
    title: "Manual / Curado",
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

  if (/(shoes|shoe|zapa|zapat|zapato|calzado|sneaker|boot|borcego|sandalia|moda|fashion|look)/.test(normalized)) {
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
    FBT: ["Compra conjunta / look completo", "Bundle / suma al ticket"],
    IA: ["Recomendacion inteligente / quick add", "Upsell contextual / mas ticket"],
    Manual: ["Seleccion curada / control editorial", "Merchandising / prioridad comercial"],
  };

  return subtitles[mode][index] ?? "Recomendacion / Vortex";
}

function getDirectPreviewImageSrc(image?: string) {
  if (!image || !/^https?:\/\//i.test(image)) {
    return "/icon.png";
  }

  return image;
}

function getPreviewImageSrc(image?: string) {
  if (!image || !/^https?:\/\//i.test(image)) {
    return "/icon.png";
  }

  return `/api/preview/image?src=${encodeURIComponent(image)}`;
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
    return `Preview lista para ${host}. Detectamos ${liveProducts.length} productos reales y armamos una propuesta ${mode} para mostrar como Vortex podria ayudarte a vender una pieza mas por compra, sin salir de esta demo.`;
  }

  return `Preview lista para ${host}. No encontramos productos publicos claros, asi que dejamos una simulacion ${mode} lista para mostrar la oportunidad comercial sin depender del storefront.`;
}

function PreviewProductImage({ image, name }: { image?: string; name: string }) {
  const directSrc = getDirectPreviewImageSrc(image);
  const proxySrc = getPreviewImageSrc(image);
  const [src, setSrc] = useState(directSrc);
  const [attempt, setAttempt] = useState<"direct" | "proxy" | "fallback">(
    directSrc === "/icon.png" ? "fallback" : "direct",
  );

  useEffect(() => {
    setSrc(directSrc);
    setAttempt(directSrc === "/icon.png" ? "fallback" : "direct");
  }, [directSrc]);

  return (
    <img
      alt={name}
      className="block h-[460px] w-full object-cover object-top"
      height="920"
      loading="eager"
      referrerPolicy="no-referrer"
      src={src}
      width="760"
      onError={() => {
        if (attempt === "direct" && proxySrc !== "/icon.png") {
          setAttempt("proxy");
          setSrc(proxySrc);
          return;
        }

        if (attempt !== "fallback") {
          setAttempt("fallback");
          setSrc("/icon.png");
        }
      }}
    />
  );
}

export function LandingPreviewExperience() {
  const requestIdRef = useRef(0);
  const [draftValue, setDraftValue] = useState(DEFAULT_INPUT);
  const [storeInput, setStoreInput] = useState(DEFAULT_INPUT);
  const [selectedMode, setSelectedMode] = useState<EngineMode | null>(null);
  const [liveProducts, setLiveProducts] = useState<LivePreviewProduct[] | null>(null);
  const [widgetFeedback, setWidgetFeedback] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState(
    "Carga una tienda y Vortex te devuelve una propuesta clara para vender mas, subir ticket promedio y mostrar mejor los productos correctos.",
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!widgetFeedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setWidgetFeedback(null);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [widgetFeedback]);

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
          ? `Mostramos ${liveProducts.length} productos reales detectados en ${host} y aplicamos la capa ${activeMode} sobre esa seleccion.`
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
          ? `${error.message} Igual te dejamos una simulacion ${recommendedMode} para mostrar el potencial.`
          : `No pudimos leer el storefront publico. Igual te dejamos una simulacion ${recommendedMode} para mostrar el potencial.`,
      );
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsPreviewLoading(false);
      }
    }
  }

  function handleWidgetDemoClick(product: PreviewProduct) {
    setWidgetFeedback(
      `Asi se veria Vortex trabajando con ${product.name}. Seguimos dentro de la demo: esto no instala nada ni abre TiendaNube.`,
    );
  }

  return (
    <>
      <section className="grid gap-8 py-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:py-12">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">
              Vortex para TiendaNube
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-[4.9rem] lg:leading-[0.94]">
              Hace que cada visita tenga mas chances de comprar una pieza mas.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Vortex combina recomendaciones inteligentes, compras conjuntas, seleccion manual y descuentos visibles para ayudar a vender mas, subir ticket promedio y mostrarle al merchant cuanto esta ganando de mas.
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
                  className="inline-flex h-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isPreviewLoading}
                  type="submit"
                >
                  {isPreviewLoading ? "Previsualizando..." : "Previsualizar potencial"}
                </button>
              </div>
              <span className="text-sm leading-6 text-slate-600">
                Este boton no instala nada. Solo arma una demo dentro de Vortex y, si la tienda es publica, intenta traer productos reales para mostrar como se veria el widget.
              </span>
            </label>

            <div className="rounded-[24px] border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-950">
              {previewStatus}
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:border-cyan-300/40 hover:bg-cyan-50"
              href="#simulacion"
            >
              Ver oportunidad comercial
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:border-cyan-300/40 hover:bg-cyan-50"
              href="#widget-preview"
            >
              Ver widget en accion
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:border-cyan-300/40 hover:bg-cyan-50"
              href="/pricing"
            >
              Ver precios
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <StatusCard
            body="Leemos la tienda, entendemos el contexto y ajustamos la demo para mostrar una oportunidad clara y facil de entender."
            label="Store detectado"
            title={previewState.host}
          />
          <StatusCard
            body="La preview cambia en tiempo real para mostrar la capa que mejor puede vender mas en esa tienda."
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

      <section className="grid gap-5 scroll-mt-28" id="simulacion">
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Lo que gana la tienda
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                Vortex ayuda a vender mas con recomendaciones claras, descuentos visibles y una forma simple de subir ticket promedio.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-700">
                {previewState.profile.lead}
              </p>
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
                La idea no es sumar otra herramienta dificil. La idea es que el merchant vea rapido como Vortex puede hacer que cada carrito valga mas y dejarlo visible en un panel simple.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Motores de recomendacion
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Elegi la forma de vender mas que mejor encaja con tu negocio.
              </h3>
            </div>

            <div className="mt-5 grid gap-3">
              {(["IA", "FBT", "Manual"] as EngineMode[]).map((mode) => {
                const isActive = mode === previewState.activeMode;
                const engineLabel = ENGINE_LABELS[mode];

                return (
                  <button
                    className={`rounded-[24px] border px-5 py-4 text-left transition ${
                      isActive
                        ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_20px_50px_-28px_rgba(14,165,233,0.75)]"
                        : "border-slate-900/10 bg-white text-slate-950 hover:border-cyan-300/40"
                    }`}
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    type="button"
                  >
                    <span className="block text-sm font-semibold">{engineLabel.title}</span>
                    <span className={`mt-1 block text-sm leading-6 ${isActive ? "text-slate-900/80" : "text-slate-600"}`}>
                      {engineLabel.description}
                    </span>
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

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-stretch">
          <div className="rounded-[30px] border border-slate-900/10 bg-white/78 p-5 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Donde conviene mostrar Vortex
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
              {previewState.profile.opportunityTitle}
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
              <p className="text-sm leading-6 text-slate-300">{previewState.profile.signalCopy}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <SmallPanel label="Ganancia proyectada" value={previewState.profile.projectedRevenue} />
                <SmallPanel label="Motor sugerido" value={previewState.profile.engine} />
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_30px_90px_-60px_rgba(15,23,42,0.85)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Activacion real
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              Si esto hace sentido para la tienda, el siguiente paso es instalar Vortex y empezar a vender mejor desde un panel simple.
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {previewState.profile.installSummary}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DarkPanel
                description="Conecta la tienda, publica el script y entra al panel sin mezclar la simulacion con el alta real."
                title="Instalacion guiada"
              />
              <DarkPanel
                description="Branding, widget, descuentos y resultados visibles dentro de una sola operacion."
                title="Panel + storefront + ROI"
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-semibold text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200"
                href={previewState.installHref}
              >
                Instalar Vortex
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/12"
                href="/pricing"
              >
                Ver precios
              </a>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-400">
              Este paso ya abre el flujo real de TiendaNube. La demo de arriba no instala nada.
            </p>
          </div>
        </div>
      </section>

      <section
        className="mt-10 rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]"
        id="dashboard-real"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Dashboard real en tienda
            </p>
            <h2 className="max-w-4xl text-3xl font-semibold tracking-[-0.05em]">
              Un panel pensado para merchants que quieren vender mas sin volverse expertos en tecnologia.
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-300">
              Vortex junta IA, compras conjuntas, seleccion manual y descuentos en un solo recorrido para que el merchant entienda rapido que activar, donde verlo y cuanto esta vendiendo de mas.
            </p>
          </div>
          <div className="flex gap-2">
            {DASHBOARD_SLIDES.map((slide, index) => (
              <button
                aria-label={`Ver slide ${index + 1}`}
                className={`h-3 w-3 rounded-full transition ${activeSlide === index ? "bg-cyan-300" : "bg-white/20"}`}
                key={slide.title}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/8 bg-slate-900/55 p-4">
          <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#040a14] p-2">
              <img
                alt={DASHBOARD_SLIDES[activeSlide]?.title}
                className="block h-full w-full rounded-[18px] object-contain"
                height="640"
                src={DASHBOARD_SLIDES[activeSlide]?.image}
                width="1080"
              />
            </div>
            <div className="space-y-4 p-2">
              <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Vista {activeSlide + 1} de {DASHBOARD_SLIDES.length}
              </span>
              <h3 className="text-3xl font-semibold tracking-[-0.05em]">
                {DASHBOARD_SLIDES[activeSlide]?.title}
              </h3>
              <p className="text-sm leading-7 text-slate-300">{DASHBOARD_SLIDES[activeSlide]?.copy}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <MerchantValuePill title="Mas ticket promedio" value="Productos, bundles y descuentos visibles para empujar una pieza mas por carrito." />
                <MerchantValuePill title="Mas claridad comercial" value="Todo dentro de un panel simple para entender que activar y como medir el resultado." />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <DarkPanel
                  description="El merchant puede elegir entre IA, compras conjuntas o una capa manual segun el tipo de tienda y el nivel de control que necesita."
                  title="Activa el motor que mas vende"
                />
                <DarkPanel
                  description="La vista previa muestra como se verian las recomendaciones, el mensaje y el descuento antes de publicarlo en vivo."
                  title="Mira como quedaria"
                />
                <DarkPanel
                  description="El panel transforma ventas atribuidas, ticket promedio y ROI en algo entendible para un merchant ocupado."
                  title="Entiende el resultado"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/12"
                  onClick={() =>
                    setActiveSlide((activeSlide - 1 + DASHBOARD_SLIDES.length) % DASHBOARD_SLIDES.length)
                  }
                  type="button"
                >
                  Anterior
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  onClick={() => setActiveSlide((activeSlide + 1) % DASHBOARD_SLIDES.length)}
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]" id="widget-preview">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Vista previa del widget
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          Asi podria verse Vortex ayudando a vender una pieza mas
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          {previewState.profile.widgetIntro}
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-400">
          Esta vista no te saca a la tienda ni instala nada. Es una simulacion visual para mostrar como se verian las recomendaciones dentro del storefront.
        </p>
        {widgetFeedback ? (
          <div className="mt-3 rounded-[20px] border border-cyan-300/18 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            {widgetFeedback}
          </div>
        ) : null}

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
              <div className="mt-4 rounded-[26px] border border-white/8 bg-slate-900/70 p-4">
                <div className="overflow-hidden rounded-[24px] border border-white/8 bg-linear-to-b from-[#0d1730] via-[#111d37] to-[#0a1224]">
                  <PreviewProductImage image={product.image} name={product.name} />
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-2xl font-semibold tracking-[-0.04em]">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{product.subtitle}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-cyan-300">
                      {product.price}
                    </p>
                  </div>
                  <button
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-cyan-200"
                    onClick={() => handleWidgetDemoClick(product)}
                    type="button"
                  >
                    Ver dentro de la demo
                  </button>
                </div>
                {product.url ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/8 px-4 text-sm font-medium text-white transition hover:border-cyan-300/30 hover:bg-white/12"
                      href={product.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Ver producto real
                    </a>
                  </div>
                ) : null}
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

function MerchantValuePill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-cyan-300/15 bg-cyan-300/8 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}
