"use client";

import { useMemo, useState } from "react";

type EngineMode = "IA" | "FBT" | "Manual";

type PreviewProduct = {
  badge: string;
  name: string;
  price: string;
  subtitle: string;
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
      "La demo sugiere una instalacion con bundles ligeros, quick add y reglas comerciales sobre productos relacionados.",
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
      "Mostramos una capa FBT con productos reales o simulados del mismo momento de compra para elevar ticket sin depender de descuentos.",
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
      "La preview honesta no audita el catalogo real: modela donde Vortex capturaria mejor el crecimiento incremental.",
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
    signalTitle: "IA recomendado para esta tienda",
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
    const url = new URL(withProtocol);

    return `${url.protocol}//${url.host}`;
  } catch {
    return trimmed;
  }
}

function getStoreHost(value: string) {
  try {
    return new URL(normalizeStoreInput(value)).host;
  } catch {
    return value.trim() || "mitienda.tiendanube.com";
  }
}

function inferEngineMode(host: string): EngineMode {
  const normalized = host.toLowerCase();

  if (/(shoes|shoe|zapa|zapat|zapato|calzado|sneaker|boot|borcego|sandal)/.test(normalized)) {
    return "FBT";
  }

  if (/(atelier|capsule|capsula|editorial|studio|concept|deco|decor|home|design)/.test(normalized)) {
    return "Manual";
  }

  return "IA";
}

function buildInstallHref(storeInput: string) {
  const normalized = normalizeStoreInput(storeInput);

  return `/oauth/tiendanube/install?store_domain=${encodeURIComponent(normalized)}`;
}

export function LandingPreviewExperience() {
  const [draftValue, setDraftValue] = useState(DEFAULT_INPUT);
  const [storeInput, setStoreInput] = useState(DEFAULT_INPUT);
  const [selectedMode, setSelectedMode] = useState<EngineMode | null>(null);

  const previewState = useMemo(() => {
    const host = getStoreHost(storeInput);
    const engineMode = selectedMode ?? inferEngineMode(host);
    const profile = PROFILES[engineMode];

    return {
      host,
      installHref: buildInstallHref(storeInput),
      profile,
    };
  }, [selectedMode, storeInput]);

  return (
    <>
      <section className="grid gap-8 py-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-start lg:py-12">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-700">
              Vortex para TiendaNube
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[6.25rem] lg:leading-[0.9]">
              Previsualiza el impacto de Vortex sobre una PDP sin meter una implementacion pesada.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Una landing comercial, una demo clara y una ruta directa a la app para mostrar
              revenue lift, placement sugerido y valor incremental sin ruido tecnico.
            </p>
          </div>

          <form
            className="grid gap-3 rounded-[32px] border border-slate-900/10 bg-white/75 p-4 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setStoreInput(normalizeStoreInput(draftValue));
              setSelectedMode(null);
            }}
          >
            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                URL de la tienda o dominio de TiendaNube
              </span>
              <input
                autoComplete="off"
                className="h-14 rounded-full border border-slate-900/10 bg-white px-5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20"
                onChange={(event) => setDraftValue(event.target.value)}
                placeholder="https://mitienda.tiendanube.com"
                type="text"
                value={draftValue}
              />
              <span className="text-sm leading-6 text-slate-600">
                  La simulacion corre local en la homepage: no te manda a TiendaNube, solo recalcula
                  la propuesta visual y el motor sugerido para esa tienda.
                </span>
              </label>

            <div className="flex items-end">
              <button
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-medium text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200 sm:w-auto"
                type="submit"
              >
                Previsualizar potencial
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-900">
              Demo lista para modelar storefront, placement y algoritmo recomendado para {previewState.host}.
            </span>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
              href="#simulacion"
            >
              Ver simulacion
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-5 text-sm font-medium text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200"
              href={previewState.installHref}
            >
              Instalar esta tienda
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
            body="El command center cambia en tiempo real para mostrar la capa mas razonable para la tienda cargada."
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

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" id="simulacion">
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
            <div className="flex h-52 items-end gap-4">
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

        <div className="grid gap-5">
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
                const isActive = mode === previewState.profile.engine;

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

          <div className="grid gap-5 md:grid-cols-2">
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
                  <dd className="mt-1 font-medium text-slate-950">{normalizeStoreInput(storeInput)}</dd>
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
                Ese espacio ahora cierra la historia con una CTA clara para activar la app.
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {previewState.profile.installSummary}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DarkPanel
                  description="Merchant-friendly, sin perder la narrativa comercial que ya abrimos en la demo."
                  title="Instalacion guiada"
                />
                <DarkPanel
                  description="La app conecta setup, storefront y revenue atribuido dentro del mismo flujo."
                  title="Widget + dashboard + ROI"
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-medium text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200"
                  href={previewState.installHref}
                >
                  Instalar la app
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
              key={product.name}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-2xl bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  {product.badge}
                </span>
              </div>
              <div className="mt-4 rounded-[26px] border border-white/8 bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 p-6">
                <div className="flex min-h-72 items-center justify-center rounded-[24px] border border-white/8 bg-radial from-slate-700/70 via-slate-900 to-slate-950 p-6">
                  <img
                    alt="Vortex preview"
                    className="h-44 w-44 rounded-[28px] shadow-[0_30px_90px_-40px_rgba(14,165,233,0.6)]"
                    height="176"
                    src="/icon.png"
                    width="176"
                  />
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.04em]">{product.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{product.subtitle}</p>
                    <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-cyan-300">
                      {product.price}
                    </p>
                  </div>
                  <span className="inline-flex h-9 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-950">
                    Quick Add
                  </span>
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
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-3xl">
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
