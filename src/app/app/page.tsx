import { StoreStatus } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfitFirstSummary } from "@/components/dashboard/profit-first-summary";
import type { AnalyticsSnapshot } from "@/components/dashboard/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const installationErrors: Record<string, { detail: string; title: string }> = {
  admin_runtime_error: {
    detail:
      "Detectamos un fallo transitorio en la validacion de sesion admin. La app limpio la sesion para evitar cruces entre tiendas y te devolvio al ingreso.",
    title: "Sesion admin reiniciada",
  },
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

const buildProfitSummary = (input: {
  catalogPreview: Awaited<ReturnType<typeof listCatalogPreview>>;
  storeId: string | null;
}) => {
  const seed = Number(input.storeId ?? 0) || 229419;
  const basePrice = input.catalogPreview[0]?.price ?? 68900;
  const organicAov = Math.round(basePrice * 1.72);
  const vortexAov = Math.round(organicAov * 1.18);
  const organicConversionRate = 2.9 + (seed % 3) * 0.2;
  const vortexConversionRate = organicConversionRate * 1.18;
  const attributedOrders = 14 + (seed % 9);
  const vortexRevenue = vortexAov * attributedOrders;
  const subscriptionCost = 24900;
  const effectivenessDelta = ((vortexAov / organicAov) - 1) * 100;
  const anchorProduct = input.catalogPreview[0]?.name ?? "Producto principal";
  const relatedProduct = input.catalogPreview[1]?.name ?? "Accesorio estrategico";

  return {
    effectivenessDelta,
    opportunity: {
      anchorProduct,
      projectedLift: 12,
      relatedProduct,
    },
    organic: {
      aov: organicAov,
      conversionRate: organicConversionRate,
      label: "Venta Organica",
    },
    subscriptionCost,
    vortex: {
      aov: vortexAov,
      conversionRate: vortexConversionRate,
      label: "Venta con Vortex (FBT/IA)",
    },
    vortexRevenue,
  };
};

const buildAnalyticsSnapshot = (input: {
  storeId: string | null;
  vortexRevenue: number;
}): AnalyticsSnapshot => {
  const seed = Number(input.storeId ?? 0) || 229419;
  const impressions = 9800 + (seed % 9) * 315;
  const clicks = Math.max(320, Math.round(impressions * 0.068));
  const conversions = Math.max(48, Math.round(clicks * 0.185));

  return {
    attributedSales: input.vortexRevenue,
    clicks,
    conversions,
    ctr: (clicks / impressions) * 100,
    cvr: (conversions / clicks) * 100,
    impressions,
    periodLabel: "Ultimos 30 dias",
  };
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
    try {
      const verifiedSession = await verifySignedSessionValue(sessionCookie, clientSecret);
      authenticatedStoreId = verifiedSession?.storeId ?? null;
    } catch {
      authenticatedStoreId = null;
    }
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
              listCatalogPreview(authenticatedStoreId, 8),
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
  const scriptDevelopmentUrl = appUrl
    ? `${appUrl}/vortex-injector.js?api_origin=${encodeURIComponent(appUrl)}`
    : "Pendiente";
  const productionLoaderUrl = appUrl ? `${appUrl}/vortex-storefront-loader.js` : "Pendiente";
  const profitSummary = buildProfitSummary({
    catalogPreview,
    storeId: authenticatedStoreId,
  });
  const analytics = buildAnalyticsSnapshot({
    storeId: authenticatedStoreId,
    vortexRevenue: profitSummary.vortexRevenue,
  });
  const storefrontBaseUrl = storefrontContext?.primaryDomain
    ? storefrontContext.primaryDomain.replace(/\/+$/, "")
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1760px] px-6 py-8 sm:px-8 lg:px-10 2xl:px-14">
      <div className="grid gap-8">
        <ProfitFirstSummary {...profitSummary} />

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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(250px,0.55fr)_minmax(320px,0.72fr)]">
          <Card className="border-white/8 bg-white/[0.03]">
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
              <CardTitle className="text-4xl tracking-[-0.04em]">Vortex Command Center</CardTitle>
              <CardDescription className="max-w-4xl text-base leading-7">
                Panel de beta privada para gobernar configuracion visual, estrategia,
                previsualizacion y activacion storefront sin tocar la base operativa ya validada.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/8 bg-white/[0.03]">
            <CardHeader>
              <CardTitle>Store actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-[15px] leading-7 text-slate-300">
              <p className="text-white">{authenticatedStoreId ? `#${authenticatedStoreId}` : "Sin sesion"}</p>
              {storefrontContext ? (
                <p className="mt-2">
                  {storefrontContext.name}
                  {storefrontContext.currencyCode ? ` / ${storefrontContext.currencyCode}` : ""}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-white/[0.03]">
            <CardHeader>
              <CardTitle>App URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-[15px] leading-7 text-slate-300">
              <p className="break-all">{appUrl || "Sin configurar"}</p>
              <p className="mt-2">
                Scopes: {environmentReady ? getTiendaNubeConfig().scopes : "Sin configurar"}
              </p>
            </CardContent>
          </Card>
        </section>

        {authenticatedStoreId && activeStore ? (
          <DashboardShell
            analytics={analytics}
            appUrl={appUrl}
            initialConfig={widgetSettings}
            productPageBaseUrl={storefrontBaseUrl}
            productionLoaderUrl={productionLoaderUrl}
            scriptDevelopmentUrl={scriptDevelopmentUrl}
            storeId={authenticatedStoreId}
            storefront={storefrontContext}
            storefrontProducts={catalogPreview}
          />
        ) : (
          <Card className="border-dashed border-white/15 bg-white/[0.03]">
            <CardHeader>
              <CardTitle>Store no disponible</CardTitle>
              <CardDescription>
                La sesion actual no tiene una tienda activa o todavia no terminamos de cargar el
                contexto storefront.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  );
}
