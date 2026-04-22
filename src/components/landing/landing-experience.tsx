"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

type Engine = "IA" | "FBT" | "Manual";

type StoreProfile = {
  accentLabel: string;
  accentTitle: string;
  accentCopy: string;
  algorithm: Engine;
  algorithmSummary: string;
  algorithmBullets: string[];
  commandCenterCopy: string;
  metrics: {
    aovBoost: string;
    recommendations: string;
    revenueLift: string;
  };
  placement: string;
  projectedRevenue: string;
  products: Array<{
    badge: string;
    name: string;
    price: string;
    subtitle: string;
  }>;
};

const ENGINE_COPY: Record<Engine, { bullets: string[]; title: string }> = {
  FBT: {
    title: "Comprados juntos frecuentemente",
    bullets: [
      "Detecta combinaciones de alto ticket para subir el valor por compra.",
      "Funciona muy bien cuando el merchant vende familias claras de producto.",
      "Empuja bundles simples sin rearmar todo el storefront.",
    ],
  },
  IA: {
    title: "IA recomendado",
    bullets: [
      "Prioriza afinidad semántica, densidad de categoría y contexto comercial.",
      "Tolera cold start con fallback seguro para no dejar espacios vacíos.",
      "Sirve cuando el catálogo necesita criterio más inteligente que una regla fija.",
    ],
  },
  Manual: {
    title: "Selección manual",
    bullets: [
      "El merchant fija productos ganadores con control editorial total.",
      "Ideal para campañas puntuales, colecciones cápsula o fechas comerciales.",
      "Se apoya en Vortex para render, placement y operación, no para decidir catálogo.",
    ],
  },
};

const STORE_PROFILES: Array<{ matchers: string[]; profile: StoreProfile }> = [
  {
    matchers: ["gautama", "saiashoes", "saia", "shoes", "shoe", "calzado", "zap"],
    profile: {
      accentLabel: "Senal activa",
      accentTitle: "FBT recomendado para esta tienda",
      accentCopy:
        "La demo sugiere una capa de combinacion de look con quick add para capturar ticket incremental sin tocar checkout ni rearmar todo el storefront.",
      algorithm: "FBT",
      algorithmSummary: "El command center cambia en tiempo real para mostrar una capa FBT visible, simple y muy facil de explicar al merchant.",
      algorithmBullets: ENGINE_COPY.FBT.bullets,
      commandCenterCopy:
        "La demo hace visible lift, AOV y densidad de recomendaciones. Vortex muestra una historia comercial facil de vender antes de instalar.",
      metrics: {
        aovBoost: "+11.8%",
        recommendations: "12",
        revenueLift: "+16.2%",
      },
      placement: "PDP / quick add contextual",
      projectedRevenue: "$1.798.496 / mes",
      products: [
        {
          badge: "01",
          name: "Zapatillas Emilia 2.0",
          price: "$37.900,00",
          subtitle: "Bundle / ticket incremental",
        },
        {
          badge: "02",
          name: "Borcegos Verona",
          price: "$66.900,00",
          subtitle: "Look complementario / quick add",
        },
      ],
    },
  },
  {
    matchers: ["skin", "beauty", "makeup", "cosmetic", "perfume", "care"],
    profile: {
      accentLabel: "Senal activa",
      accentTitle: "IA recomendada para esta tienda",
      accentCopy:
        "La simulacion prioriza afinidad semántica y contexto de compra para sugerir productos que suman AOV sin parecer un pop-up agresivo.",
      algorithm: "IA",
      algorithmSummary: "La capa IA es la más razonable para este storefront porque necesita criterio comercial y fallback limpio.",
      algorithmBullets: ENGINE_COPY.IA.bullets,
      commandCenterCopy:
        "La demo ordena oportunidad, algoritmo y placement para mostrar una propuesta comercial clara sin convertir la landing en una doc técnica.",
      metrics: {
        aovBoost: "+9.4%",
        recommendations: "17",
        revenueLift: "+13.1%",
      },
      placement: "PDP / recomendacion contextual",
      projectedRevenue: "$1.224.880 / mes",
      products: [
        {
          badge: "01",
          name: "Routine Booster",
          price: "$24.990,00",
          subtitle: "Afinidad / cross-sell guiado",
        },
        {
          badge: "02",
          name: "Night Repair Serum",
          price: "$31.700,00",
          subtitle: "Upsell contextual",
        },
      ],
    },
  },
];

const DEFAULT_PROFILE: StoreProfile = {
  accentLabel: "Senal activa",
  accentTitle: "IA recomendada para esta tienda",
  accentCopy:
    "La simulacion prioriza una capa de recomendaciones clara, un placement visible y un motor que haga sentido comercial para la etapa actual de la tienda.",
  algorithm: "IA",
  algorithmSummary:
    "El command center cambia en tiempo real para mostrar la capa más razonable para la tienda cargada.",
  algorithmBullets: ENGINE_COPY.IA.bullets,
  commandCenterCopy:
    "La demo hace visible lift, AOV y densidad de recomendaciones para vender impacto y no solo configuración.",
  metrics: {
    aovBoost: "+10.5%",
    recommendations: "17",
    revenueLift: "+14.7%",
  },
  placement: "PDP / quick add contextual",
  projectedRevenue: "$1.412.650 / mes",
  products: [
    {
      badge: "01",
      name: "Complemento inteligente",
      price: "$15.089",
      subtitle: "Afinidad / quick add",
    },
    {
      badge: "02",
      name: "Upsell contextual",
      price: "$15.106",
      subtitle: "Momento de conversion",
    },
  ],
};

function normalizeStoreUrl(rawValue: string) {
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return "https://mitienda.tiendanube.com";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getHostname(urlValue: string) {
  try {
    return new URL(normalizeStoreUrl(urlValue)).hostname.replace(/^www\./i, "");
  } catch {
    return urlValue.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  }
}

function resolveStoreProfile(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();
  const matchedProfile = STORE_PROFILES.find(({ matchers }) =>
    matchers.some((matcher) => normalizedHostname.includes(matcher)),
  );

  return matchedProfile?.profile ?? DEFAULT_PROFILE;
}

export function LandingExperience() {
  const [storeInput, setStoreInput] = useState("https://mitienda.tiendanube.com");
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);

  const hostname = useMemo(() => getHostname(storeInput), [storeInput]);
  const profile = useMemo(() => resolveStoreProfile(hostname), [hostname]);
  const activeEngine = selectedEngine ?? profile.algorithm;
  const activeEngineCopy = ENGINE_COPY[activeEngine];

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
              Esta demo modela que algoritmo conviene, donde conviene ubicar el widget y que
              revenue lift podria capturarse con una capa de recomendaciones simple, visible y
              lista para quick add.
            </p>
          </div>

          <form
            className="grid gap-3 rounded-[32px] border border-slate-950/10 bg-white/75 p-4 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                URL de la tienda o dominio de TiendaNube
              </span>
              <input
                autoComplete="off"
                className="h-14 rounded-full border border-slate-900/10 bg-white px-5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20"
                onChange={(event) => setStoreInput(event.target.value)}
                placeholder="https://mitienda.tiendanube.com"
                type="text"
                value={storeInput}
              />
              <span className="text-sm leading-6 text-slate-600">
                La simulacion ordena oportunidad, widget y dashboard real en un recorrido simple
                para merchants, sin meter pasos tecnicos innecesarios.
              </span>
            </label>

            <div className="flex items-end">
              <Button className="w-full sm:w-auto" size="lg" type="submit">
                Previsualizar potencial
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-900">
              Demo lista para modelar storefront, placement y algoritmo recomendado.
            </span>
            <Button asChild variant="secondary">
              <Link href="/app">Ver command center</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="#widget-preview">Ver widget</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <StatusCard
            body="La URL define el perfil de la demo y ajusta oportunidad, productos sugeridos y enfoque de recomendacion."
            label="Store detectado"
            title={hostname}
          />
          <StatusCard
            body={profile.algorithmSummary}
            label="Modo actual"
            title={`Preview / ${activeEngine} recomendado`}
          />
          <StatusCard
            accent
            body={profile.accentCopy}
            label={profile.accentLabel}
            title={profile.accentTitle}
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" id="preview">
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
              {activeEngine} recomendado
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Revenue lift" value={profile.metrics.revenueLift} />
            <MetricCard label="AOV boost" value={profile.metrics.aovBoost} />
            <MetricCard label="Recomendaciones" value={profile.metrics.recommendations} />
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-cyan-300/20 bg-linear-to-b from-cyan-200/30 via-cyan-100/60 to-transparent p-5">
            <div className="flex h-52 items-end gap-4">
              {[0.34, 0.48, 0.42, 0.62, 0.8, 0.66].map((barHeight, index) => (
                <div
                  className="flex-1 rounded-t-[999px] bg-linear-to-b from-cyan-300 to-cyan-100 shadow-[0_20px_50px_-25px_rgba(14,165,233,0.6)]"
                  key={`${barHeight}-${index}`}
                  style={{ height: `${Math.round(barHeight * 100)}%` }}
                />
              ))}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">
              {profile.commandCenterCopy}
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
              {(["IA", "FBT", "Manual"] as Engine[]).map((engine) => {
                const isActive = engine === activeEngine;

                return (
                  <button
                    className={`rounded-full border px-5 py-4 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-[0_20px_50px_-28px_rgba(14,165,233,0.75)]"
                        : "border-slate-900/10 bg-white text-slate-950 hover:border-slate-900/20 hover:bg-slate-50"
                    }`}
                    key={engine}
                    onClick={() => setSelectedEngine(engine)}
                    type="button"
                  >
                    {engine}
                  </button>
                );
              })}
            </div>

            <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
              {activeEngineCopy.bullets.map((bullet) => (
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
                  <dd className="mt-1 font-medium text-slate-950">{normalizeStoreUrl(storeInput)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Placement sugerido
                  </dt>
                  <dd className="mt-1 font-medium text-slate-950">{profile.placement}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-[26px] border border-cyan-300/20 bg-slate-950 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Oportunidad detectada
                </p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.04em]">
                  Hay una oportunidad de lift visible en producto sin necesidad de una implementacion pesada.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  La simulacion prioriza una capa de recomendaciones clara, un placement visible y
                  un motor que haga sentido comercial para la etapa actual de la tienda.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SmallPanel label="Revenue proyectado" value={profile.projectedRevenue} />
                  <SmallPanel label="Algoritmo sugerido" value={activeEngine} />
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
                La preview ya muestra oportunidad, algoritmo y dashboard real. El paso natural ahora
                es llevar al merchant a una instalacion simple con impacto visible desde el primer recorrido.
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
                <Button asChild size="lg">
                  <Link href={`/oauth/tiendanube/install?store_domain=${encodeURIComponent(normalizeStoreUrl(storeInput))}`}>
                    Instalar la app
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/app">Abrir command center</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5" id="implementation">
        <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Implementacion
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            La historia se vende mejor cuando la preview conecta widget, dashboard real y resultado visible.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoTile
              copy="El merchant ve estrategia, branding, placement y reglas desde un panel ordenado y mucho mas facil de entender que una instalacion tecnica."
              title="Configuracion simple"
            />
            <InfoTile
              copy="La vista encapsulada permite revisar storefront, copy y recomendacion antes de mover nada en la tienda en vivo."
              title="Preview antes de publicar"
            />
            <InfoTile
              copy="Revenue atribuido, operacion y contexto comercial quedan dentro del mismo flujo para vender impacto y no solo configuracion."
              title="Analytics y operacion"
            />
          </div>
        </div>

        <div className="rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Dashboard real en tienda
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
            Estas son 3 vistas del dashboard ya funcionando sobre un merchant real.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Configuracion del widget, storefront preview y lectura de ROI dentro del mismo recorrido.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.1fr_0.75fr]">
            <DashboardColumn
              lines={[
                "Algoritmo sugerido",
                "Quick add y CTA",
                "Branding y colores",
                "Placement y reglas",
                "Estado de publicacion",
              ]}
              title="Configuracion del widget"
            />
            <DashboardPreviewCard />
            <DashboardColumn
              lines={[
                "Ganancia extra generada",
                "AOV atribuido",
                "Conversion uplift",
                "Insight accionable",
                "Operacion y storefront",
              ]}
              title="Analytics funnel"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]" id="widget-preview">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Vista previa del widget
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
          {activeEngine === "FBT" ? "Comprados juntos" : "Completá tu look"}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Recomendaciones activadas sobre la URL cargada para sumar AOV sin intervenir el tema completo.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {profile.products.map((product) => (
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
                  <Image
                    alt="Vortex preview"
                    className="h-44 w-44 rounded-[28px] shadow-[0_30px_90px_-40px_rgba(14,165,233,0.6)]"
                    height={176}
                    src="/icon.png"
                    width={176}
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
                  <Button size="sm">Quick Add</Button>
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

function InfoTile({ copy, title }: { copy: string; title: string }) {
  return (
    <article className="rounded-[28px] border border-slate-900/10 bg-white p-5 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.45)]">
      <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
    </article>
  );
}

function DashboardColumn({ lines, title }: { lines: string[]; title: string }) {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/6 p-4">
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <div className="mt-4 grid gap-3">
        {lines.map((line) => (
          <div className="rounded-[20px] border border-white/8 bg-slate-900/65 px-4 py-3 text-sm text-slate-300" key={line}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPreviewCard() {
  return (
    <div className="rounded-[28px] border border-white/8 bg-white/6 p-4">
      <div className="rounded-[24px] border border-white/8 bg-linear-to-b from-slate-900 via-slate-950 to-black p-4">
        <div className="rounded-[20px] border border-white/10 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-full bg-cyan-300/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Preview merchant
            </span>
            <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Pagina de producto</span>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[22px] border border-white/8 bg-white/6 p-4">
              <div className="flex h-72 items-center justify-center rounded-[20px] bg-linear-to-b from-slate-300 to-slate-100">
                <Image alt="Preview Vortex" className="h-40 w-40 rounded-[26px]" height={160} src="/icon.png" width={160} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[18px] bg-cyan-300/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Seleccion manual
              </div>
              <h3 className="text-4xl font-semibold tracking-[-0.06em] text-white">
                Llevate algo que combine mejor con esta compra
              </h3>
              <p className="text-sm leading-6 text-slate-300">
                Preview aislado del storefront para validar branding, copy y placement antes de publicar.
              </p>
              <div className="rounded-[22px] border border-white/8 bg-white/6 p-4">
                <p className="text-sm text-slate-300">Quick Add contextual + analytics del mismo flujo.</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-cyan-300">$52.900,00</p>
                  <Button size="sm">Quick Add</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
