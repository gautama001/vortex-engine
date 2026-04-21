import Link from "next/link";

import { InstallForm } from "@/components/install-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasCoreEnvironment } from "@/lib/env";
import { RELEASE_MARKER } from "@/lib/release";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

const proofPoints = [
  { label: "Revenue lift", value: "+14.7%" },
  { label: "AOV boost", value: "+10.5%" },
  { label: "Setup", value: "Simple" },
];

const steps = [
  {
    step: "01",
    copy: "Pegas la URL de la tienda y Vortex la convierte en una demo útil en segundos.",
    title: "Detectar",
  },
  {
    step: "02",
    copy: "La landing muestra dónde conviene entrar, qué algoritmo usar y cuánto lift puede capturar.",
    title: "Simular",
  },
  {
    step: "03",
    copy: "El merchant sigue directo al dashboard y al install flow sin ruido técnico.",
    title: "Instalar",
  },
];

const storefrontBullets = [
  "Widget visible en PDP o carrito.",
  "Quick add con recomendaciones contextualizadas.",
  "Fallback seguro si todavía falta data histórica.",
];

export default function HomePage() {
  noStore();
  const environmentReady = hasCoreEnvironment();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(103,232,249,0.18), transparent 24%), radial-gradient(circle at 84% 16%, rgba(59,130,246,0.15), transparent 28%), radial-gradient(circle at 50% 100%, rgba(14,165,233,0.08), transparent 30%), linear-gradient(180deg, #f4efe5 0%, #efe7d6 45%, #f7f4ec 100%)",
        }}
      />

      <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-900/10 bg-white/65 px-4 py-3 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
            <span className="text-lg font-semibold">V</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Vortex Engine</p>
            <p className="text-xs text-slate-600">Preview liviana para TiendaNube</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
          <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#simulacion">
            Simulacion
          </Link>
          <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#widget">
            Widget demo
          </Link>
          <Link className="rounded-full px-3 py-2 hover:bg-slate-950/5" href="#implementacion">
            Implementacion
          </Link>
        </nav>

        <Button asChild size="sm" variant="secondary">
          <Link href="/app">Abrir app</Link>
        </Button>
      </header>

      <section className="grid gap-6 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-10">
        <div className="flex flex-col gap-6">
          <div className="space-y-5">
            <Badge tone={environmentReady ? "success" : "danger"}>
              {environmentReady ? "Runtime listo" : "Config pendiente"}
            </Badge>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Release {RELEASE_MARKER}
            </p>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-600">
                Vortex para TiendaNube
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                Recomendaciones que convierten sin pedirle al merchant que piense como developer.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Una landing simple, una demo clara y una install que lleva directo a impacto
                comercial. Menos explicación técnica, más ventas visibles.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <Card className="border-slate-950/10 bg-white/75" key={item.label}>
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <InstallForm />

          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
              Simulacion comercial
            </span>
            <span className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
              Widget listo
            </span>
            <span className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]">
              Dashboard real
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="overflow-hidden border-slate-950/10 bg-slate-950 text-white shadow-[0_30px_120px_-60px_rgba(15,23,42,0.9)]">
            <CardHeader className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <Badge tone="info">Simulacion</Badge>
                <span className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">
                  Demo lista
                </span>
              </div>
              <CardTitle className="max-w-md text-3xl tracking-[-0.05em] text-white">
                Mostramos oportunidad, widget y camino a instalar Vortex.
              </CardTitle>
              <CardDescription className="max-w-xl text-slate-300">
                El merchant entiende el valor sin leer arquitectura ni tocar un setup pesado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pb-6 sm:grid-cols-3">
              {proofPoints.map((metric) => (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4" key={metric.label}>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/60">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-cyan-200">
                    {metric.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-950/10 bg-white/82" id="widget">
              <CardHeader>
                <Badge>Widget demo</Badge>
                <CardTitle className="text-2xl tracking-[-0.04em] text-slate-950">
                  Quick add con contexto.
                </CardTitle>
                <CardDescription className="text-slate-600">
                  El widget aparece donde importa y deja la compra a un paso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {storefrontBullets.map((line) => (
                  <div
                    className="rounded-2xl border border-slate-900/8 bg-slate-950/[0.03] p-4 text-sm text-slate-700"
                    key={line}
                  >
                    {line}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-950/10 bg-white/82" id="simulacion">
              <CardHeader>
                <Badge>Implementacion</Badge>
                <CardTitle className="text-2xl tracking-[-0.04em] text-slate-950">
                  Instalacion guiada, sin friccion.
                </CardTitle>
                <CardDescription className="text-slate-600">
                  El merchant pasa de la preview al dashboard y al storefront en un flujo corto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step) => (
                  <div className="flex gap-4" key={step.title}>
                    <div className="min-w-10 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                      {step.step}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">{step.title}</p>
                      <p className="text-sm leading-6 text-slate-600">{step.copy}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        className="mb-8 grid gap-4 rounded-[32px] border border-slate-900/10 bg-white/70 p-5 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:grid-cols-[1.2fr_0.8fr]"
        id="implementacion"
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Storefront y dashboard
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Un index que vende la historia completa, no solo el producto.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            La landing abre con valor comercial, sigue con la simulacion y termina en una CTA que
            ya no parece tecnica.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild size="lg">
            <Link href="/app">Ver command center</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="https://tiendanube.github.io/api-documentation/v1/resources/discounts">
              Ver docs de descuentos
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
