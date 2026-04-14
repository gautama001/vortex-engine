import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    body:
      "Vortex procesa datos de instalacion de la tienda, credenciales de acceso API y metadatos tecnicos necesarios para entregar recomendaciones de producto y operar la aplicacion dentro de TiendaNube.",
    title: "Datos que procesamos",
  },
  {
    body:
      "Los datos se utilizan para autenticar la instalacion, consultar catalogo de productos, generar recomendaciones y mantener la integridad operativa del servicio.",
    title: "Finalidad del tratamiento",
  },
  {
    body:
      "Vortex no fue disenado para almacenar informacion personal sensible de clientes finales en este MVP. Cuando TiendaNube solicita webhooks de privacidad, respondemos y eliminamos o confirmamos la inexistencia de datos persistidos segun corresponda.",
    title: "Privacidad de clientes",
  },
  {
    body:
      "La informacion tecnica se conserva mientras la tienda tenga la aplicacion instalada o durante el tiempo estrictamente necesario para cumplir obligaciones operativas y legales.",
    title: "Retencion y eliminacion",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8">
      <div className="space-y-6">
        <Badge tone="info">Privacy Policy</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
            Politica de privacidad de Vortex
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            Esta politica describe como Vortex, una aplicacion operada por Elevate Studio,
            procesa la informacion necesaria para funcionar dentro de TiendaNube.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-4 pt-6 text-sm leading-7 text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Para consultas sobre privacidad, acceso o eliminacion de datos, escribi a
            `ayrtonzampietri@gmail.com`.
          </p>
          <Button asChild variant="secondary">
            <Link href="/support">Contactar soporte</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
