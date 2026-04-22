import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";

import { Button } from "@/components/ui/button";
import { hasCoreEnvironment } from "@/lib/env";
import { BUILD_TIMESTAMP, RELEASE_MARKER } from "@/lib/release";
import { LandingExperience } from "@/components/landing/landing-experience";

export const dynamic = "force-dynamic";

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
              <Image alt="Vortex Engine" height={48} src="/icon.png" width={48} />
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.03em] text-slate-950">Vortex Engine</p>
              <p className="text-sm text-slate-600">Preview liviana para TiendaNube</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
            <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#preview">
              Simulacion
            </Link>
            <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#widget-preview">
              Widget demo
            </Link>
            <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#implementation">
              Implementacion
            </Link>
            <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#resources">
              Recursos
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/app">Abrir app</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/oauth/tiendanube/install">Instalar</Link>
            </Button>
          </div>
        </header>

        <LandingExperience />

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
                    <Button asChild variant="secondary">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
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
                description={environmentReady ? "La base del runtime esta lista para servir la app." : "Faltan variables base o algun paso de runtime por completar."}
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
              <Button asChild variant="secondary">
                <Link href="/build-state.json">Ver build state</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/api/health">Ver api health</Link>
              </Button>
            </div>
          </aside>
        </section>

        <footer className="mt-8 grid gap-5 rounded-[34px] border border-slate-900/10 bg-white/72 px-6 py-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.35)] backdrop-blur-xl md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="overflow-hidden rounded-[18px] border border-slate-900/10">
                <Image alt="Vortex Engine" height={40} src="/icon.png" width={40} />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">Vortex Engine</p>
                <p className="text-sm text-slate-600">
                  IA + merchandising + revenue layer para TiendaNube.
                </p>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Previsualiza potencial, activa widgets, conecta descuentos reales y opera el
              storefront desde un command center pensado para merchants.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <Link className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/privacy">
              Privacidad
            </Link>
            <Link className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/support">
              Soporte
            </Link>
            <Link className="rounded-full border border-slate-900/10 px-4 py-2 hover:bg-slate-950/5" href="/app">
              Dashboard
            </Link>
          </div>
        </footer>
      </div>
    </main>
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
