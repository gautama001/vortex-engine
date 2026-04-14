import Link from "next/link";

import { InstallForm } from "@/components/install-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { hasCoreEnvironment } from "@/lib/env";

const capabilities = [
  "OAuth 2.0 de TiendaNube con persistencia en Prisma/PostgreSQL.",
  "Cold start inteligente: related by category/tag y fallback a best sellers.",
  "Script storefront sin dependencias con Quick Add via LS.cart.addItem.",
];

export default function HomePage() {
  const environmentReady = hasCoreEnvironment();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
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
              Vortex Engine / TiendaNube Recommendations Core
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Recomendaciones Nexus-grade para storefronts que no pueden esperar datos perfectos.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              El MVP queda preparado para Vercel, App Router, Prisma y widgets de upsell/cross-sell
              con una estrategia de fallback robusta desde el dia cero.
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
                <p className="font-medium text-white">Auth Core</p>
                <p className="mt-2 leading-6 text-slate-300">
                  `/api/auth/install`, `/api/auth/callback`, sesiones firmadas y asociacion opcional
                  del script manual.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Recommendation Engine</p>
                <p className="mt-2 leading-6 text-slate-300">
                  `/api/v1/recommendations` resuelve related products por senales semanticas y
                  rellena con best sellers cuando el store no tiene data suficiente.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Injector</p>
                <p className="mt-2 leading-6 text-slate-300">
                  `public/vortex-injector.js` detecta Product Page o Cart, consulta la API y
                  renderiza Quick Add dentro del DOM de TiendaNube.
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
