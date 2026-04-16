import Link from "next/link";

import { InstallForm } from "@/components/install-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { hasCoreEnvironment } from "@/lib/env";

const capabilities = [
  "Instalacion guiada para merchants de TiendaNube con sesion segura por tienda.",
  "Recomendaciones listas para PDP y carrito con fallback automatico cuando falta data.",
  "Quick add nativo y merchandising visual configurable sin tocar el theme.",
];

export default function HomePage() {
  const environmentReady = hasCoreEnvironment();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, rgba(34,211,238,0.14), transparent 38%), radial-gradient(circle at 85% 20%, rgba(59,130,246,0.16), transparent 24%), linear-gradient(180deg, #07111a 0%, #04070d 60%, #02050a 100%)",
        }}
      />
      <div className="flex items-center justify-between">
        <Badge tone={environmentReady ? "success" : "danger"}>
          {environmentReady ? "Runtime listo" : "Config pendiente"}
        </Badge>

        <Button asChild size="sm" variant="ghost">
          <Link href="/app">Abrir control plane</Link>
        </Button>
      </div>

      <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.25fr_0.95fr] lg:py-14">
        <div className="space-y-7">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-200/80">
              Vortex para TiendaNube
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Upsell, cross-sell y bundles visuales listos para vender mas desde el storefront.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Vortex conecta tu tienda, analiza catalogo y publica widgets de recomendaciones con
              quick add real, branding configurable y una experiencia pensada para mobile commerce.
            </p>
          </div>

          <InstallForm />

          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((capability) => (
              <Card className="border-white/8 bg-white/[0.03]" key={capability}>
                <CardContent className="pt-6 text-sm leading-6 text-slate-300">
                  {capability}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <Badge>Arquitectura base</Badge>
            <CardTitle>Vortex Auth + Logic + Injector</CardTitle>
            <CardDescription>
              El repo nace con un pipeline listo para conectar una app de TiendaNube real: install,
              callback, HMAC, recommendations API y storefront widget.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Instalacion y autenticacion</p>
                <p className="mt-2 leading-6 text-slate-300">
                  Flujo OAuth con callback, sesion firmada por tienda y recuperacion segura cuando
                  TiendaNube reabre la app sin contexto completo.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Motor de recomendaciones</p>
                <p className="mt-2 leading-6 text-slate-300">
                  Estrategias IA, FBT y seleccion manual para alimentar widgets de producto y
                  carrito con fallback a best sellers cuando el store todavia no tiene señales.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Widget storefront</p>
                <p className="mt-2 leading-6 text-slate-300">
                  Inyeccion liviana para product page y cart drawer, con quick add, descuentos
                  visuales y grillas adaptadas para desktop y mobile.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3 text-sm">
              <Button asChild variant="secondary">
                <Link href="/app">Abrir dashboard merchant</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="https://tiendanube.github.io/api-documentation/resources/script">
                  Docs Scripts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
