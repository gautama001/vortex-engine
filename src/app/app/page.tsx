import { StoreStatus } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";

import { StoreSettingsForm } from "@/components/store-settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getTiendaNubeConfig, hasCoreEnvironment } from "@/lib/env";
import { ADMIN_SESSION_COOKIE, verifySignedSessionValue } from "@/lib/security";
import { ensureStorePersistence } from "@/lib/store-persistence";
import { listCatalogPreview } from "@/services/catalog-service";
import { getStorefrontContext } from "@/services/storefront-service";
import {
  DEFAULT_STORE_WIDGET_SETTINGS,
  getStoreByTiendaNubeId,
  getStoreWidgetSettings,
} from "@/services/store-service";

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

const buildStorefrontProductUrl = (domain: string, handle: string | null): string => {
  const normalizedDomain = domain.replace(/\/+$/, "");
  const normalizedHandle = (handle ?? "").replace(/^\/+/, "");

  if (!normalizedHandle) {
    return normalizedDomain;
  }

  return `${normalizedDomain}/productos/${normalizedHandle}`;
};

export default async function AppDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();

  const environmentReady = hasCoreEnvironment();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;
  const appUrl = process.env.TIENDANUBE_APP_URL ?? "";
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorParam = resolvedSearchParams.error;
  const errorCode = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const storeIdParam = resolvedSearchParams.store_id;
  const attemptedStoreId = Array.isArray(storeIdParam) ? storeIdParam[0] : storeIdParam;
  const persistenceDetailParam = resolvedSearchParams.persistence_detail;
  const persistenceDetail = Array.isArray(persistenceDetailParam)
    ? persistenceDetailParam[0]
    : persistenceDetailParam;
  const authStatusParam = resolvedSearchParams.auth_status;
  const authStatus = Array.isArray(authStatusParam) ? authStatusParam[0] : authStatusParam;
  const authDetailParam = resolvedSearchParams.auth_detail;
  const authDetail = Array.isArray(authDetailParam) ? authDetailParam[0] : authDetailParam;
  const installationError = errorCode ? installationErrors[errorCode] : null;

  let authenticatedStoreId: string | null = null;
  let persistenceReady = false;
  let activeStore = null as Awaited<ReturnType<typeof getStoreByTiendaNubeId>>;
  let catalogPreview = [] as Awaited<ReturnType<typeof listCatalogPreview>>;
  let storefrontContext = null as Awaited<ReturnType<typeof getStorefrontContext>>;

  if (sessionCookie && clientSecret) {
    const verifiedSession = await verifySignedSessionValue(sessionCookie, clientSecret);
    authenticatedStoreId = verifiedSession?.storeId ?? null;
  }

  if (environmentReady) {
    try {
      await ensureStorePersistence();
      persistenceReady = true;

      if (authenticatedStoreId) {
        activeStore = await getStoreByTiendaNubeId(authenticatedStoreId);

        if (activeStore?.status === StoreStatus.ACTIVE) {
          try {
            const [catalogResult, storefrontResult] = await Promise.all([
              listCatalogPreview(authenticatedStoreId, 6),
              getStorefrontContext(authenticatedStoreId),
            ]);
            catalogPreview = catalogResult;
            storefrontContext = storefrontResult;
          } catch {
            catalogPreview = [];
            storefrontContext = null;
          }
        }
      }
    } catch {
      persistenceReady = false;
      activeStore = null;
      catalogPreview = [];
      storefrontContext = null;
    }
  }

  const widgetSettings = activeStore
    ? getStoreWidgetSettings(activeStore)
    : DEFAULT_STORE_WIDGET_SETTINGS;
  const scriptDevelopmentUrl = appUrl ? `${appUrl}/vortex-injector.js` : "Pendiente";
  const sampleProductId = catalogPreview[0]?.id;
  const recommendationsPreviewUrl =
    appUrl && authenticatedStoreId
      ? `${appUrl}/api/v1/recommendations?store_id=${authenticatedStoreId}${
          sampleProductId ? `&product_id=${sampleProductId}` : ""
        }`
      : "Pendiente";
  const storefrontPreviewUrl =
    storefrontContext?.primaryDomain && catalogPreview[0]?.handle
      ? buildStorefrontProductUrl(storefrontContext.primaryDomain, catalogPreview[0].handle)
      : storefrontContext?.primaryDomain ?? null;

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
              <CardTitle className="text-4xl tracking-[-0.04em]">Merchant Control Plane</CardTitle>
              <CardDescription className="max-w-2xl">
                Panel de operacion del MVP para prender el widget, ajustar copy, validar el script y
                dejar lista la tienda para pruebas reales de producto.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Auth</p>
                <p className="mt-3 text-3xl font-semibold text-white">OAuth 2.0</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Instalacion persistida, sesion firmada y estado claro para iterar sin friccion.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Config</p>
                <p className="mt-3 text-3xl font-semibold text-white">Merchant settings</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Titulo, subtitulo, paginas activas y cantidad de recomendaciones por tienda.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Storefront</p>
                <p className="mt-3 text-3xl font-semibold text-white">Zero deps</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Inyeccion Vanilla JS en Product Page y Cart con Quick Add usando LS.cart.addItem.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operacion</CardTitle>
              <CardDescription>
                Variables criticas, estado del runtime y links de activacion para la tienda.
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
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Store actual</p>
                <p className="mt-2">{authenticatedStoreId ? `#${authenticatedStoreId}` : "Sin sesion"}</p>
                {storefrontContext ? (
                  <p className="mt-2 text-slate-400">
                    {storefrontContext.name}
                    {storefrontContext.currencyCode ? ` | ${storefrontContext.currencyCode}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="ghost">
                  <Link href="/">Volver al landing</Link>
                </Button>
                {storefrontContext?.primaryDomain ? (
                  <Button asChild variant="secondary">
                    <Link href={storefrontContext.primaryDomain} target="_blank">
                      Abrir storefront
                    </Link>
                  </Button>
                ) : null}
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
              {errorCode === "token_exchange_failed" && (authStatus || authDetail) ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  {authStatus ? (
                    <p>
                      Status TiendaNube: <span className="text-white">{authStatus}</span>
                    </p>
                  ) : null}
                  {authDetail ? (
                    <p className="mt-2 break-words">
                      Detalle: <span className="text-white">{authDetail}</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
              {errorCode === "store_persistence_failed" && persistenceDetail ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="break-words">
                    Detalle: <span className="text-white">{persistenceDetail}</span>
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Configuracion del widget</CardTitle>
              <CardDescription>
                Ajusta la UX storefront por tienda. Los cambios se guardan sobre la store instalada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoreSettingsForm
                initialSettings={widgetSettings}
                storeId={activeStore?.tiendanubeId ?? authenticatedStoreId ?? ""}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activacion de storefront</CardTitle>
              <CardDescription>
                Lo minimo para prender Vortex en TiendaNube y empezar a testear producto real.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">Development URL del script</p>
                <p className="mt-2 break-all">{scriptDevelopmentUrl}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">Preview API</p>
                <p className="mt-2 break-all">{recommendationsPreviewUrl}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">Setup del script</p>
                <p className="mt-2">1. Partner Portal -&gt; Scripts -&gt; Crear script.</p>
                <p>2. Location: `store`.</p>
                <p>3. Event: `onfirstinteraction`.</p>
                <p>4. Development URL: la que ves arriba.</p>
                <p>5. Probar en `Vortex Demo` antes de activarlo globalmente.</p>
              </div>
              {storefrontPreviewUrl ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-medium text-white">Pagina sugerida para test</p>
                  <p className="mt-2 break-all">{storefrontPreviewUrl}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Productos detectados</CardTitle>
            <CardDescription>
              IDs publicados para elegir rapido un seed product y testear recomendaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {catalogPreview.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-slate-300">
                No pudimos listar productos publicados todavia. Si la tienda tiene catalogo, recarga
                el panel en unos segundos.
              </div>
            ) : (
              catalogPreview.map((product) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  key={product.id}
                >
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Product ID</p>
                  <p className="mt-2 text-xl font-semibold text-white">#{product.id}</p>
                  <p className="mt-3 text-sm text-slate-200">{product.name}</p>
                  <p className="mt-2 break-all text-xs text-slate-400">
                    {product.handle
                      ? buildStorefrontProductUrl(
                          storefrontContext?.primaryDomain ?? "https://tu-tienda.com",
                          product.handle,
                        )
                      : "Sin handle"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store conectada</CardTitle>
            <CardDescription>
              Estado visible solo para la tienda autenticada en esta sesion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!activeStore ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-slate-300">
                No hay una store autenticada para esta sesion o todavia no pudimos cargar su estado.
              </div>
            ) : (
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-lg font-medium text-white">Store #{activeStore.tiendanubeId}</p>
                  <p className="mt-2 text-sm text-slate-300">Scopes: {activeStore.scope}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Widget: {activeStore.widgetEnabled ? "activo" : "apagado"} | Pages:{" "}
                    {activeStore.productPageEnabled ? "producto" : "sin producto"} /{" "}
                    {activeStore.cartPageEnabled ? "carrito" : "sin carrito"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Updated {activeStore.updatedAt.toISOString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <Badge tone={statusTone[activeStore.status]}>{activeStore.status}</Badge>
                </div>
              </div>
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
