"use client";

import { useCallback, useMemo } from "react";
import { BarChart3, RadioTower, Sparkles, Store } from "lucide-react";

import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { ConfigurationForm } from "@/components/dashboard/configuration-form";
import {
  DashboardProvider,
  useDashboardActions,
  useDashboardState,
} from "@/components/dashboard/dashboard-provider";
import { LiveAuditor } from "@/components/dashboard/live-auditor";
import type {
  AnalyticsSnapshot,
  MerchantPreviewProduct,
  MerchantStorefrontContext,
  PersistedWidgetConfig,
} from "@/components/dashboard/types";
import {
  widgetConfigFromPersisted,
  widgetConfigToPersisted,
} from "@/components/dashboard/types";
import { VisualPreview } from "@/components/dashboard/visual-preview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formatCurrencyArs = (value: number): string => {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-AR").format(value);
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}%`;
};

type DashboardShellProps = {
  analytics: AnalyticsSnapshot;
  appUrl: string;
  initialConfig: PersistedWidgetConfig;
  productPageBaseUrl: string | null;
  productionLoaderUrl: string;
  scriptDevelopmentUrl: string;
  storeId: string;
  storefront: MerchantStorefrontContext | null;
  storefrontProducts: MerchantPreviewProduct[];
};

const DashboardContent = ({
  analytics,
  appUrl,
  productPageBaseUrl,
  productionLoaderUrl,
  scriptDevelopmentUrl,
  storeId,
  storefront,
  storefrontProducts,
}: Omit<DashboardShellProps, "initialConfig">) => {
  const { commitConfig, selectProduct, setDraftConfig } = useDashboardActions();
  const { draftConfig, lastSavedAt, savedConfig, selectedProductId } = useDashboardState();

  const handleConfigChange = useCallback(
    (config: PersistedWidgetConfig) => {
      setDraftConfig(widgetConfigFromPersisted(config));
    },
    [setDraftConfig],
  );

  const handleConfigSaved = useCallback(
    (config: PersistedWidgetConfig, updatedAt: string) => {
      commitConfig(widgetConfigFromPersisted(config), updatedAt);
    },
    [commitConfig],
  );

  const persistedDraft = useMemo(() => widgetConfigToPersisted(draftConfig), [draftConfig]);
  const persistedSaved = useMemo(() => widgetConfigToPersisted(savedConfig), [savedConfig]);

  const orderedProducts = useMemo(() => {
    if (!selectedProductId) {
      return storefrontProducts;
    }

    const selectedProduct = storefrontProducts.find((product) => product.id === selectedProductId);

    if (!selectedProduct) {
      return storefrontProducts;
    }

    return [
      selectedProduct,
      ...storefrontProducts.filter((product) => product.id !== selectedProductId),
    ];
  }, [selectedProductId, storefrontProducts]);

  const previewApiUrl = useMemo(() => {
    const query = new URLSearchParams({
      store_id: storeId,
    });

    if (selectedProductId) {
      query.set("product_id", String(selectedProductId));
    }

    return `${appUrl}/api/v1/recommendations?${query.toString()}`;
  }, [appUrl, selectedProductId, storeId]);

  const storefrontUrl = useMemo(() => {
    const selectedProduct = orderedProducts[0];

    if (!productPageBaseUrl || !selectedProduct?.handle) {
      return productPageBaseUrl;
    }

    return `${productPageBaseUrl}/productos/${selectedProduct.handle}`;
  }, [orderedProducts, productPageBaseUrl]);

  return (
    <section className="grid gap-7 xl:grid-cols-[390px_minmax(0,1fr)_340px] 2xl:grid-cols-[430px_minmax(0,1fr)_380px]">
      <div className="grid gap-7">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-cyan-300" />
              <CardTitle className="text-[2rem] leading-none">Configuracion del widget</CardTitle>
            </div>
            <CardDescription>
              Ajusta branding, algoritmo y placement con guardado optimista por tienda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfigurationForm
              onConfigChange={handleConfigChange}
              onSaved={handleConfigSaved}
              savedConfig={persistedSaved}
              storeId={storeId}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-7">
        <VisualPreview config={persistedDraft} products={orderedProducts} storefront={storefront} />
        <LiveAuditor
          onSelectProduct={selectProduct}
          previewApiUrl={previewApiUrl}
          products={storefrontProducts}
          selectedProductId={selectedProductId}
          storefrontUrl={storefrontUrl}
        />
      </div>

      <div className="grid gap-7">
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-300" />
              <CardTitle className="text-[2rem] leading-none">Analytics funnel</CardTitle>
            </div>
            <CardDescription>
              Lectura rapida de rendimiento para vender el ROI cada vez que el merchant entra.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <AnalyticsCard
              etiqueta="Ventas atribuidas"
              porcentaje={formatPercentage(analytics.cvr)}
              tono="positivo"
              valor={formatCurrencyArs(analytics.attributedSales)}
            />
            <AnalyticsCard etiqueta="Impresiones" valor={formatNumber(analytics.impressions)} />
            <AnalyticsCard
              etiqueta="Clics"
              porcentaje={formatPercentage(analytics.ctr)}
              tono="positivo"
              valor={formatNumber(analytics.clicks)}
            />
            <AnalyticsCard
              etiqueta="Conversiones"
              porcentaje={formatPercentage(analytics.cvr)}
              tono="positivo"
              valor={formatNumber(analytics.conversions)}
            />
            <div className="rounded-[26px] border border-white/8 bg-slate-950/45 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Ventas atribuidas
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">{analytics.periodLabel}</p>
                </div>
                <Badge tone="success">ROI visible</Badge>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="clip-funnel rounded-[24px] bg-white/[0.04] px-5 py-5 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Impresiones</p>
                  <p className="mt-2 text-[2.1rem] font-semibold text-white">
                    {formatNumber(analytics.impressions)}
                  </p>
                </div>
                <div className="mx-auto w-[84%] rounded-[22px] bg-white/[0.05] px-5 py-5 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Clics</p>
                  <p className="mt-2 text-[1.9rem] font-semibold text-white">
                    {formatNumber(analytics.clicks)}
                  </p>
                </div>
                <div className="mx-auto w-[68%] rounded-[20px] bg-cyan-400/10 px-5 py-5 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">
                    Conversiones
                  </p>
                  <p className="mt-2 text-[1.9rem] font-semibold text-white">
                    {formatNumber(analytics.conversions)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <RadioTower className="h-4 w-4 text-cyan-300" />
              <CardTitle className="text-[2rem] leading-none">Operacion</CardTitle>
            </div>
            <CardDescription>
              Lo minimo para mantener la beta controlada y prender storefront sin friccion.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 text-[15px] leading-7 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
              <p className="font-medium text-white">Development URL</p>
              <p className="mt-2 break-all">{scriptDevelopmentUrl}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
              <p className="font-medium text-white">Loader productivo</p>
              <p className="mt-2 break-all">{productionLoaderUrl}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
              <p className="font-medium text-white">Ultima publicacion</p>
              <p className="mt-2">
                {lastSavedAt
                  ? new Intl.DateTimeFormat("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(lastSavedAt))
                  : "Sin cambios publicados en esta sesion"}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5">
              <div className="flex items-center gap-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">Store activa</span>
              </div>
              <p className="mt-3 text-base font-medium text-white">
                {storefront?.name ?? "Store"} / #{storeId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export const DashboardShell = ({
  analytics,
  appUrl,
  initialConfig,
  productPageBaseUrl,
  productionLoaderUrl,
  scriptDevelopmentUrl,
  storeId,
  storefront,
  storefrontProducts,
}: DashboardShellProps) => {
  return (
    <DashboardProvider
      initialConfig={widgetConfigFromPersisted(initialConfig)}
      initialSelectedProductId={storefrontProducts[0]?.id ?? null}
    >
      <DashboardContent
        analytics={analytics}
        appUrl={appUrl}
        productPageBaseUrl={productPageBaseUrl}
        productionLoaderUrl={productionLoaderUrl}
        scriptDevelopmentUrl={scriptDevelopmentUrl}
        storeId={storeId}
        storefront={storefront}
        storefrontProducts={storefrontProducts}
      />
    </DashboardProvider>
  );
};
