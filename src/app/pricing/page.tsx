import { PricingTable } from "@/components/pricing-table";

export const metadata = {
  description:
    "Planes de Vortex Engine para TiendaNube: Core, Pro y Elite con success fee, ROI proyectado y alcance claro para cada merchant.",
  title: "Precios | Vortex Engine",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1A] px-5 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/8 bg-white/5 px-4 py-3 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="overflow-hidden rounded-[20px] border border-white/8">
              <img alt="Vortex Engine" className="block h-12 w-12" height="48" src="/icon.png" width="48" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.03em] text-white">Vortex Engine</p>
              <p className="text-sm text-slate-400">Planes y ROI para TiendaNube</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/12 bg-white/8 px-4 text-sm font-medium text-white transition hover:border-cyan-300/30 hover:bg-white/12"
              href="/"
            >
              Volver al home
            </a>
            <a
              className="inline-flex h-10 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              href="/api/auth/install"
            >
              Instalar Vortex
            </a>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Pricing</p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.065em] text-white sm:text-6xl lg:text-[5.2rem] lg:leading-[0.92]">
              Elegi el plan segun el control, la inteligencia y la ganancia que queres capturar con Vortex.
            </h1>
          </div>

          <div className="rounded-[30px] border border-cyan-300/14 bg-white/5 p-6">
            <p className="text-lg leading-8 text-slate-300">
              Vortex esta pensado para vender mejor, no para sumar otra herramienta dificil de operar. Cada plan combina suscripcion, success fee y una lectura mas clara del impacto real en ticket promedio y ventas cruzadas.
            </p>
          </div>
        </section>

        <PricingTable />
      </div>
    </main>
  );
}
