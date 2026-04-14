import { StoreStatus } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTiendaNubeConfig, hasCoreEnvironment } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, verifySignedSessionValue } from "@/lib/security";
import { ensureStorePersistence } from "@/lib/store-persistence";
import { listRecentStores } from "@/services/store-service";

export const dynamic = "force-dynamic";

const statusTone: Record<StoreStatus, "danger" | "info" | "success"> = {
  ACTIVE: "success",
  PENDING: "info",
  SUSPENDED: "danger",
  UNINSTALLED: "danger",
};

const installationErrors: Record<string, { detail: string; title: string }> = {
  callback_failed: {
    detail: "El callback fallo, pero el runtime no devolvio una causa mas especifica.",
    title: "Callback incompleto",
  },
  invalid_state: {
    detail: "La instalacion llego con un state invalido o incompleto.",
    title: "State invalido",
  },
  store_persistence_failed: {
    detail:
      "TiendaNube devolvio el code, pero Vortex no pudo guardar la store. Suele ser schema faltante, base inaccesible o credenciales DB invalidas.",
    title: "Persistencia fallida",
  },
  token_exchange_failed: {
    detail:
      "La app recibio el callback, pero no pudo intercambiar el code por access_token. Revisar client secret y configuracion OAuth.",
    title: "Token exchange fallido",
  },
};

export default async function AppDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const environmentReady = hasCoreEnvironment();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorParam = resolvedSearchParams.error;
  const errorCode = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const storeIdParam = resolvedSearchParams.store_id;
  const attemptedStoreId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;
  const installationError = errorCode ? installationErrors[errorCode] : null;

  let authenticatedStoreId: string | null = null;
  let persistenceReady = false;
  let stores = [] as Awaited<ReturnType<typeof listRecentStores>>;

  if (sessionCookie && clientSecret) {
    const verifiedSession = await verifySignedSessionValue(sessionCookie, clientSecret);
    authenticatedStoreId = verifiedSession?.storeId ?? null;
  }

  if (environmentReady) {
    try {
      await ensureStorePersistence();
      persistenceReady = true;
      stores = await listRecentStores(5);
    } catch {
      persistenceReady = false;
      stores = [];
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
      <div className="grid gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={environmentReady ? "success" : "danger"}>
                  {environmentReady ? "Infra lista" : "Faltan variables"}
                </Badge>
                <Badge tone={persistenceReady ? "success" : "danger"}>
                  {persistenceReady ? "Schema lista" : "Schema pendiente"}
                </Badge>
                {authenticatedStoreId ? (
                  <Badge tone="info">Store activa #{authenticatedStoreId}</Badge>
                ) : null}
              </div>
              <CardTitle className="text-4xl tracking-[-0.04em]">Control Plane</CardTitle>
              <CardDescription className="max-w-2xl">
                Dashboard minimo para validar instalaciones, exponer la salud del runtime y dejar
                visible el estado actual del engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Auth</p>
                <p className="mt-3 text-3xl font-semibold text-white">OAuth 2.0</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Estado, persistencia y cookie firmada para la superficie admin.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Logic</p>
                <p className="mt-3 text-3xl font-semibold text-white">Fallback chain</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Tags/categorias primero, best sellers cuando la senal es insuficiente.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Storefront</p>
                <p className="mt-3 text-3xl font-semibold text-white">Zero deps</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Inyeccion Vanilla JS orientada a Product Page y Cart.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operacion</CardTitle>
              <CardDescription>
                Variables criticas, callback y recomendaciones expuestas para pruebas rapidas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">App URL</p>
                <p className="mt-2 break-all">{process.env.TIENDANUBE_APP_URL ?? "Sin configurar"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Scopes</p>
                <p className="mt-2">
                  {environmentReady ? getTiendaNubeConfig().scopes : "Sin configurar"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Persistencia</p>
                <p className="mt-2">
                  {environmentReady
                    ? persistenceReady
                      ? "Schema lista"
                      : "Schema pendiente o inaccesible"
                    : "Sin configurar"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="primary">
                  <Link href="/api/auth/install">Nueva instalacion</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/">Volver al landing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {installationError ? (
          <Card className="border-amber-400/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-2xl text-white">{installationError.title}</CardTitle>
              <CardDescription className="text-amber-100/80">
                {installationError.detail}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              {attemptedStoreId ? (
                <p>
                  Store reportada por TiendaNube: <span className="text-white">#{attemptedStoreId}</span>
                </p>
              ) : null}
              <p>
                Si la app figura activada en TiendaNube pero esta tarjeta aparece, el problema esta
                de nuestro lado y no en la aprobacion del merchant.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Stores registradas</CardTitle>
            <CardDescription>
              Snapshot del estado persistido en PostgreSQL a traves del modelo `Store`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stores.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-slate-300">
                No hay instalaciones persistidas todavia o el runtime aun no tiene acceso a la base.
              </div>
            ) : (
              stores.map((store) => (
                <div
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto]"
                  key={store.id}
                >
                  <div>
                    <p className="text-lg font-medium text-white">Store #{store.tiendanubeId}</p>
                    <p className="mt-2 text-sm text-slate-300">Scopes: {store.scope}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                      Updated {store.updatedAt.toISOString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge tone={statusTone[store.status]}>{store.status}</Badge>
                  </div>
                </div>
              ))
            )}

            <Separator />

            <p className="text-sm leading-6 text-slate-400">
              El middleware protege `/app` con sesion firmada y tambien acepta un query `hmac`
              firmado para deep links administrativos cuando la plataforma lo provea.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
