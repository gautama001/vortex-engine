import { unstable_noStore as noStore } from "next/cache";

import { LandingPreviewExperience } from "@/components/landing-preview-experience";
import { BUILD_TIMESTAMP, RELEASE_MARKER } from "@/lib/release";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const implementationTiles = [
  {
    copy: "El merchant ve estrategia, branding, placement y reglas desde un panel ordenado y mucho mas facil de entender que una instalacion tecnica.",
    title: "Configuracion simple",
  },
  {
    copy: "La vista encapsulada permite revisar storefront, copy y recomendacion antes de mover nada en la tienda en vivo.",
    title: "Preview antes de publicar",
  },
  {
    copy: "Revenue atribuido, operacion y contexto comercial quedan dentro del mismo flujo para vender impacto y no solo configuracion.",
    title: "Analytics y operacion",
  },
];

const resourceLinks = [
  {
    copy: "Flujo de instalacion, command center y activacion storefront.",
    href: "/app",
    label: "Abrir app",
  },
  {
    copy: "Instalacion guiada para conectar Vortex con TiendaNube.",
    href: "/oauth/tiendanube/install",
    label: "Instalar Vortex",
  },
  {
    copy: "Centro de ayuda para merchants y operacion diaria.",
    href: "/support",
    label: "Soporte",
  },
  {
    copy: "Politicas de privacidad y tratamiento de datos.",
    href: "/privacy",
    label: "Privacidad",
  },
];

export default function HomePage() {
  noStore();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5efe3] text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(103,232,249,0.16),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(59,130,246,0.14),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.08),transparent_30%),linear-gradient(180deg,#f6f2e8_0%,#efe7d8_42%,#f8f5ee_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/45 to-transparent" />

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-10 pt-5 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-900/10 bg-white/70 px-4 py-3 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-[20px] border border-slate-900/10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.55)]">
              <img alt="Vortex Engine" className="block h-12 w-12" height="48" src="/icon.png" width="48" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.03em] text-slate-950">Vortex Engine</p>
              <p className="text-sm text-slate-600">Preview liviana para TiendaNube</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#simulacion">
              Simulacion
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#widget-preview">
              Widget demo
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#implementation">
              Implementacion
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#resources">
              Recursos
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <a
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
              href="/app"
            >
              Abrir app
            </a>
            <a
              className="inline-flex h-9 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200"
              href="/oauth/tiendanube/install"
            >
              Instalar
            </a>
          </div>
        </header>

        <div className="sr-only" data-vortex-build={BUILD_TIMESTAMP} data-vortex-release={RELEASE_MARKER}>
          vortex-homepage-live-marker
        </div>

        <LandingPreviewExperience />

        <section className="mt-8 grid gap-5" id="implementation">
          <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Implementacion
            </p>
            <h2 className="mt-2 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              La historia se vende mejor cuando la preview conecta widget, dashboard real y resultado visible.
            </h2>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {implementationTiles.map((tile) => (
                <InfoTile key={tile.title} copy={tile.copy} title={tile.title} />
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Dashboard real en tienda
            </p>
            <h2 className="mt-2 max-w-4xl text-3xl font-semibold tracking-[-0.05em]">
              Estas son 3 vistas del dashboard ya funcionando sobre un merchant real.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Configuracion del widget, storefront preview y lectura de ROI dentro del mismo recorrido.
            </p>

            <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.12fr_0.78fr]">
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

        <section className="mt-8 rounded-[34px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl" id="resources">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Recursos
          </p>
          <h2 className="mt-2 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Botones claros para todo lo que Vortex ofrece hoy.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Instalacion, command center, soporte y privacidad dentro del mismo index, sin cajas tecnicas
            ni links que el merchant no entienda.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {resourceLinks.map((item) => (
              <article
                className="flex h-full flex-col rounded-[28px] border border-slate-900/10 bg-white p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.35)]"
                key={item.label}
              >
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{item.label}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.copy}</p>
                <div className="mt-5">
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-8 grid gap-5 rounded-[34px] border border-slate-900/10 bg-white/72 px-6 py-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.35)] backdrop-blur-xl md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-[18px] border border-slate-900/10">
                <img alt="Vortex Engine" className="block h-10 w-10" height="40" src="/icon.png" width="40" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Vortex Engine</p>
                <p className="text-sm text-slate-600">IA + merchandising + revenue layer para TiendaNube.</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Previsualiza potencial, activa widgets, conecta descuentos reales y opera el storefront
              desde un command center pensado para merchants.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <a className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/privacy">
              Privacidad
            </a>
            <a className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/support">
              Soporte
            </a>
            <a className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/app">
              Dashboard
            </a>
          </div>
        </footer>
      </div>
    </main>
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
          <div
            className="rounded-[20px] border border-white/8 bg-slate-900/65 px-4 py-3 text-sm text-slate-300"
            key={line}
          >
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

          <div className="mt-5 grid gap-5 md:grid-cols-[0.3fr_0.7fr]">
            <div className="rounded-[22px] border border-white/8 bg-white/6 p-4">
              <div className="flex h-full min-h-72 items-center justify-center rounded-[20px] bg-linear-to-b from-slate-300 to-slate-100">
                <img alt="Preview Vortex" className="h-40 w-40 rounded-[26px]" height="160" src="/icon.png" width="160" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[18px] bg-cyan-300/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Seleccion manual
              </div>
              <h3 className="max-w-sm text-4xl font-semibold tracking-[-0.06em] text-white">
                Llevate algo que combine mejor con esta compra
              </h3>
              <p className="max-w-md text-sm leading-6 text-slate-300">
                Preview aislado del storefront para validar branding, copy y placement antes de publicar.
              </p>
              <div className="max-w-sm rounded-[22px] border border-white/8 bg-white/6 p-4">
                <p className="text-sm text-slate-300">Quick Add contextual + analytics del mismo flujo.</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-cyan-300">$52.900,00</p>
                  <span className="inline-flex h-9 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-950">
                    Quick Add
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
