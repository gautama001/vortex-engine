"use client";

import { useMemo } from "react";
import { RefreshCcw, ShieldCheck, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdminSessionRecoveryProps = {
  appUrl: string;
};

const STORE_ADMIN_DOMAIN_PATTERN =
  /(^|\.)((mitiendanube\.com)|(tiendanube\.com)|(nuvemshop\.[a-z.]+))$/i;

const normalizeStoreDomain = (value: string): string | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const candidate = /^https?:\/\//i.test(trimmedValue)
      ? new URL(trimmedValue).hostname
      : trimmedValue.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

    return STORE_ADMIN_DOMAIN_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
};

export const AdminSessionRecovery = ({ appUrl }: AdminSessionRecoveryProps) => {
  const reconnectUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const referrer = document.referrer ? new URL(document.referrer) : null;
    const candidateHost = referrer ? normalizeStoreDomain(referrer.host) : null;

    if (!candidateHost) {
      return null;
    }

    return `${appUrl}/oauth/tiendanube/install?store_domain=${encodeURIComponent(
      `https://${candidateHost}/`,
    )}`;
  }, [appUrl]);

  return (
    <section className="grid gap-8">
      <Card className="border-cyan-300/20 bg-cyan-400/8">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sesion merchant
          </div>
          <CardTitle className="text-4xl tracking-[-0.04em]">
            Volvamos a enlazar Vortex con tu tienda
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-200">
            TiendaNube abrio el panel sin reenviar el contexto firmado de la tienda. La
            instalacion no se perdio, pero necesitamos refrescar la sesion segura para volver a
            cargar productos, configuracion y storefront sin cruces entre merchants.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="grid gap-3 text-sm leading-6 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="font-medium text-white">Que paso</p>
              <p className="mt-2">
                El admin de TiendaNube reabrio <code>/app</code> sin la firma HMAC ni una cookie
                valida de Vortex. Por eso el panel puede entrar, pero no sabe a que store debe
                vincularse.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="font-medium text-white">Que hacemos ahora</p>
              <p className="mt-2">
                Reautorizamos la sesion contra la misma tienda y Vortex vuelve a pedir el contexto
                correcto sin hardcodear ningun merchant.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {reconnectUrl ? (
              <Button asChild className="min-w-[220px]" size="lg">
                <a href={reconnectUrl}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reenlazar tienda actual
                </a>
              </Button>
            ) : null}

            <Button asChild className="min-w-[220px]" size="lg" variant="secondary">
              <a href="/">
                <Store className="mr-2 h-4 w-4" />
                Ir al flujo de instalacion
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
