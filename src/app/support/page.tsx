import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const supportItems = [
  "Soporte de instalacion y autenticacion OAuth.",
  "Asistencia para configuracion de scripts y storefront widgets.",
  "Seguimiento de incidencias tecnicas relacionadas con recomendaciones.",
];

export default function SupportPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-8">
      <div className="space-y-6">
        <Badge tone="success">Support</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
            Soporte de Vortex
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            Elevate Studio brinda soporte para instalacion, configuracion y operacion de Vortex
            dentro de TiendaNube.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {supportItems.map((item) => (
          <Card key={item}>
            <CardContent className="pt-6 text-sm leading-7 text-slate-300">{item}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Canales de contacto</CardTitle>
          <CardDescription>
            Respuesta por correo para validaciones de instalacion, errores de integracion y soporte
            operativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
          <p>
            E-mail: <a className="text-cyan-200" href="mailto:ayrtonzampietri@gmail.com">ayrtonzampietri@gmail.com</a>
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="mailto:ayrtonzampietri@gmail.com?subject=Soporte%20Vortex">
                Escribir a soporte
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/app">Abrir configuracion</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
