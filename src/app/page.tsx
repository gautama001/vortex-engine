import { unstable_noStore as noStore } from "next/cache";

import { hasCoreEnvironment } from "@/lib/env";
import { BUILD_TIMESTAMP, RELEASE_MARKER } from "@/lib/release";

export const dynamic = "force-dynamic";

const metrics = [
  { label: "Revenue lift", value: "+14.7%" },
  { label: "AOV boost", value: "+10.5%" },
  { label: "Recomendaciones", value: "17" },
];

const engineBullets = [
  "Afinidad semantica sobre tags y categoria.",
  "Fallback inteligente si falta senal historica.",
  "Prioridad para productos con mejor combinacion de margen y contexto.",
];

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

const widgetProducts = [
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
];

export default function HomePage() {
  noStore();

  const environmentReady = hasCoreEnvironment();
  const formattedBuildDate = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(BUILD_TIMESTAMP));

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f5efe3] text-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(103,232,249,0.16),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(59,130,246,0.14),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.08),transparent_30%),linear-gradient(180deg,#f6f2e8_0%,#efe7d8_42%,#f8f5ee_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/45 to-transparent" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-10 pt-5 sm:px-8 lg:px-10">
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
              action="/oauth/tiendanube/install"
              className="grid gap-3 rounded-[32px] border border-slate-900/10 bg-white/75 p-4 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:grid-cols-[1fr_auto]"
              method="GET"
            >
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  URL de la tienda o dominio de TiendaNube
                </span>
                <input
                  autoComplete="off"
                  className="h-14 rounded-full border border-slate-900/10 bg-white px-5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-300/20"
                  name="store_domain"
                  placeholder="https://mitienda.tiendanube.com"
                  type="text"
                />
                <span className="text-sm leading-6 text-slate-600">
                  La simulacion ordena oportunidad, widget y dashboard real en un recorrido simple
                  para merchants, sin meter pasos tecnicos innecesarios.
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
                Demo lista para modelar storefront, placement y algoritmo recomendado.
              </span>
              <a
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
                href="/app"
              >
                Ver command center
              </a>
              <a
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
                href="#widget-preview"
              >
                Ver widget
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <StatusCard
              body="La URL define el perfil de la demo y ajusta oportunidad, productos sugeridos y enfoque de recomendacion."
              label="Store detectado"
              title="mitienda.tiendanube.com"
            />
            <StatusCard
              body="El command center cambia en tiempo real para mostrar la capa mas razonable para la tienda cargada."
              label="Modo actual"
              title="Preview / IA recomendado"
            />
            <StatusCard
              accent
              body="La simulacion prioriza una capa de recomendaciones clara, un placement visible y un motor que haga sentido comercial para la etapa actual de la tienda."
              label="Senal activa"
              title="IA recomendado para esta tienda"
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
                IA recomendado
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
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
                La preview honesta no audita el catalogo real: modela donde Vortex capturaria mejor
                el crecimiento incremental.
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
                <div className="rounded-full border border-cyan-300 bg-cyan-300 px-5 py-4 text-left text-sm font-semibold text-slate-950 shadow-[0_20px_50px_-28px_rgba(14,165,233,0.75)]">
                  IA
                </div>
                <div className="rounded-full border border-slate-900/10 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-950">
                  FBT
                </div>
                <div className="rounded-full border border-slate-900/10 bg-white px-5 py-4 text-left text-sm font-semibold text-slate-950">
                  Manual
                </div>
              </div>

              <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
                {engineBullets.map((bullet) => (
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
                    <dd className="mt-1 font-medium text-slate-950">https://mitienda.tiendanube.com</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Placement sugerido
                    </dt>
                    <dd className="mt-1 font-medium text-slate-950">PDP / quick add contextual</dd>
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
                    <SmallPanel label="Revenue proyectado" value="$1.798.496 / mes" />
                    <SmallPanel label="Algoritmo sugerido" value="IA" />
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
                  <a
                    className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-6 text-sm font-medium text-slate-950 shadow-[0_0_60px_-24px_rgba(103,232,249,0.85)] transition hover:bg-cyan-200"
                    href="/oauth/tiendanube/install"
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

        <section className="mt-8 grid gap-5" id="implementation">
          <div className="rounded-[32px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Implementacion
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              La historia se vende mejor cuando la preview conecta widget, dashboard real y resultado visible.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {implementationTiles.map((tile) => (
                <InfoTile key={tile.title} copy={tile.copy} title={tile.title} />
              ))}
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
            Completa tu look
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Recomendaciones activadas sobre la URL cargada para sumar AOV sin intervenir el tema completo.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {widgetProducts.map((product) => (
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

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.75fr]" id="resources">
          <div className="rounded-[34px] border border-slate-900/10 bg-white/78 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Recursos
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              Botones claros para todo lo que Vortex ofrece hoy.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Documentacion, soporte, instalacion y acceso al command center dentro del mismo index,
              sin dejar links tecnicos sueltos ni obligar al merchant a adivinar el siguiente paso.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {resourceLinks.map((item) => (
                <article
                  className="rounded-[28px] border border-slate-900/10 bg-white p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.35)]"
                  key={item.label}
                >
                  <h3 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{item.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
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
          </div>

          <aside className="rounded-[34px] border border-cyan-300/15 bg-slate-950 p-6 text-white shadow-[0_30px_100px_-55px_rgba(15,23,42,0.95)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Estado y confianza
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              La capa operativa queda visible, pero no invade la venta.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Separar recursos tecnicos del discurso comercial hace que el index sea mas util para
              homologacion, soporte y seguimiento de despliegues.
            </p>

            <div className="mt-6 grid gap-3">
              <RuntimeTile
                description={
                  environmentReady
                    ? "La base del runtime esta lista para servir la app."
                    : "Faltan variables base o algun paso de runtime por completar."
                }
                label="Runtime"
                value={environmentReady ? "Listo" : "Pendiente"}
              />
              <RuntimeTile
                description={`Build generado ${formattedBuildDate}.`}
                label="Release"
                value={RELEASE_MARKER}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
                href="/build-state.json"
              >
                Ver build state
              </a>
              <a
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 px-5 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-slate-900/80"
                href="/api/health"
              >
                Ver api health
              </a>
            </div>
          </aside>
        </section>

        <footer className="mt-8 grid gap-5 rounded-[34px] border border-slate-900/10 bg-white/72 px-6 py-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.35)] backdrop-blur-xl md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-[18px] border border-slate-900/10">
                <img alt="Vortex Engine" className="block h-10 w-10" height="40" src="/icon.png" width="40" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Vortex Engine</p>
                <p className="text-sm text-slate-600">
                  IA + merchandising + revenue layer para TiendaNube.
                </p>
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

          <div className="mt-5 grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[22px] border border-white/8 bg-white/6 p-4">
              <div className="flex h-72 items-center justify-center rounded-[20px] bg-linear-to-b from-slate-300 to-slate-100">
                <img alt="Preview Vortex" className="h-40 w-40 rounded-[26px]" height="160" src="/icon.png" width="160" />
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

function RuntimeTile({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/6 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-cyan-200">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
