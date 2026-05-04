import { unstable_noStore as noStore } from "next/cache";

import { LandingPreviewExperience } from "@/components/landing-preview-experience";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const benefitTiles = [
  {
    copy: "Vortex ayuda a que cada cliente vea una recomendacion util en el momento justo para sumar una pieza mas sin rehacer la tienda ni sumar complejidad operativa.",
    title: "Subi ticket promedio sin rehacer tu tienda",
  },
  {
    copy: "IA, compras conjuntas y seleccion manual conviven dentro del mismo panel para que el merchant pueda automatizar o conservar control editorial segun su tipo de negocio.",
    title: "Usa el motor que mejor calza con tu negocio",
  },
  {
    copy: "La recomendacion no queda en promesa: Vortex conecta storefront, descuentos y ventas atribuidas para mostrar si realmente esta vendiendo mas y cuanto deja de ganancia.",
    title: "Hace visible la ganancia que genera la app",
  },
];

const implementationTiles = [
  {
    copy: "Conecta la tienda, publica la capa storefront y entra al panel sin depender de una implementacion pesada ni de un equipo tecnico grande.",
    title: "Instalacion guiada",
  },
  {
    copy: "Antes de mover nada en vivo, el merchant puede ver una simulacion del widget y revisar copy, branding y placement con claridad.",
    title: "Preview antes de publicar",
  },
  {
    copy: "Despues, Vortex muestra si hubo mas ticket promedio, mas ventas cruzadas y mas ganancia atribuida para que el retorno quede visible.",
    title: "Operacion y ROI visibles",
  },
];

const resourceLinks = [
  {
    copy: "Entra al panel real para configurar motores, branding, widget y descuentos sin salir del flujo comercial.",
    cta: "Abrir app",
    href: "/app",
    label: "Panel de Vortex",
  },
  {
    copy: "Conecta Vortex con TiendaNube y activa la capa storefront en un flujo real separado de la demo.",
    cta: "Instalar ahora",
    href: "/api/auth/install",
    label: "Instalacion",
  },
  {
    copy: "Entiende que incluye cada plan, cuanto paga cada tienda y como se proyecta la ganancia atribuida con Vortex.",
    cta: "Ver precios",
    href: "/pricing",
    label: "Precios",
  },
  {
    copy: "Ayuda clara para merchants que necesitan resolver rapido sin pasar por una capa tecnica.",
    cta: "Ver soporte",
    href: "/support",
    label: "Soporte",
  },
];

export default function HomePage() {
  noStore();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5efe3] text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(103,232,249,0.16),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(59,130,246,0.14),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.08),transparent_30%),linear-gradient(180deg,#f6f2e8_0%,#efe7d8_42%,#f8f5ee_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/45 to-transparent" />

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-16 pt-5 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-slate-900/10 bg-white/70 px-3 py-3 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:gap-4 sm:rounded-full sm:px-4">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-[20px] border border-slate-900/10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.55)]">
              <img alt="Vortex Engine" className="block h-12 w-12" height="48" src="/icon.png" width="48" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.03em] text-slate-950">Vortex Engine</p>
              <p className="text-sm text-slate-600">IA comercial para vender mas en TiendaNube</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#simulacion">
              Simulacion
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#dashboard-real">
              Casos reales
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#widget-preview">
              Widget demo
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="/pricing">
              Precios
            </a>
            <a className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#resources">
              Recursos
            </a>
          </nav>

          <div className="grid w-full min-w-0 grid-cols-3 gap-1.5 sm:w-auto sm:grid-cols-none sm:grid-flow-col sm:gap-2">
            <a
              className="inline-flex h-9 min-w-0 items-center justify-center rounded-full border border-slate-900/10 bg-white px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-950 transition hover:border-cyan-300/40 hover:bg-cyan-50 sm:px-4 sm:text-xs sm:tracking-[0.24em]"
              href="/pricing"
            >
              Ver precios
            </a>
            <a
              className="inline-flex h-9 min-w-0 items-center justify-center rounded-full border border-slate-500/30 bg-slate-600 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white transition hover:border-slate-400/40 hover:bg-slate-500 sm:px-4 sm:text-xs sm:tracking-[0.24em]"
              href="/app"
            >
              Abrir app
            </a>
            <a
              className="inline-flex h-9 min-w-0 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200 sm:px-4 sm:text-xs sm:tracking-[0.24em]"
              href="/api/auth/install"
            >
              Instalar
            </a>
          </div>
        </header>

        <LandingPreviewExperience />

        <section className="mt-14 rounded-[34px] border border-slate-900/10 bg-white/80 p-7 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Por que Vortex le sirve a un merchant real
          </p>
          <h2 className="mt-2 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
            No vendemos un panel tecnico. Vendemos una forma mas clara de subir ventas cruzadas y ticket promedio.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {benefitTiles.map((tile) => (
              <InfoTile key={tile.title} copy={tile.copy} title={tile.title} />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[34px] border border-slate-900/10 bg-white/78 p-7 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl scroll-mt-28 sm:p-8" id="implementation">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Como entra Vortex en la operacion
          </p>
          <h2 className="mt-2 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Instalacion simple, preview clara y resultados visibles para que el merchant entienda rapido de que se trata.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {implementationTiles.map((tile) => (
              <InfoTile key={tile.title} copy={tile.copy} title={tile.title} />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[34px] border border-slate-900/10 bg-white/78 p-7 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl scroll-mt-28 sm:p-8" id="resources">
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Recursos</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                Un index claro para entender que hace Vortex, cuanto cuesta y cual es el siguiente paso.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
                Documentacion, instalacion, precios y soporte sin mezclar la demo con el flujo real del producto.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Precios y ROI</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                Tres planes para crecer con Vortex segun el nivel de control, automatizacion y lectura de ROI que necesita cada tienda.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                La pagina de precios explica alcance, success fee y una calculadora simple para estimar ganancia atribuida y retorno sin perder tiempo en tecnicismos.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  href="/pricing"
                >
                  Ver precios
                </a>
                <a
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/12"
                  href="/api/auth/install"
                >
                  Instalar Vortex
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {resourceLinks.map((item) => (
              <article
                className="flex h-full flex-col rounded-[28px] border border-slate-900/10 bg-white p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.35)]"
                key={item.label}
              >
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{item.label}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.copy}</p>
                <div className="mt-5">
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-slate-900 px-5 text-sm font-medium text-slate-50 transition hover:border-cyan-300/35 hover:bg-slate-800"
                    href={item.href}
                  >
                    {item.cta}
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
                <p className="text-sm text-slate-600">IA + merchandising + descuentos para subir ticket en TiendaNube.</p>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Una app para vender mejor sin volver tecnica la operacion del merchant: recomendaciones, quick add, descuentos y ganancia atribuida dentro del mismo recorrido.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <a className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/pricing">
              Precios
            </a>
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
