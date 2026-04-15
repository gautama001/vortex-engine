"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, WandSparkles } from "lucide-react";

import type { MerchantPreviewProduct, StrategyValue } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LiveAuditorProps = {
  manualSelectionProductIds: number[];
  onProductsLoaded: (products: MerchantPreviewProduct[]) => void;
  onSelectProduct: (productId: number) => void;
  onToggleManualProduct: (productId: number) => void;
  previewApiUrl: string;
  products: MerchantPreviewProduct[];
  recommendationAlgorithm: StrategyValue;
  selectedProductId: number | null;
  storefrontUrl: string | null;
};

type ProductSearchPayload = {
  products?: MerchantPreviewProduct[];
};

const parseJsonSafely = <T,>(rawValue: string): T | null => {
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

export const LiveAuditor = ({
  manualSelectionProductIds,
  onProductsLoaded,
  onSelectProduct,
  onToggleManualProduct,
  previewApiUrl,
  products,
  recommendationAlgorithm,
  selectedProductId,
  storefrontUrl,
}: LiveAuditorProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<MerchantPreviewProduct[]>([]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setRemoteResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/v1/store/products?query=${encodeURIComponent(normalizedQuery)}&limit=24`,
          {
            cache: "no-store",
            credentials: "same-origin",
          },
        );
        const rawPayload = await response.text();
        const payload = parseJsonSafely<ProductSearchPayload>(rawPayload);
        const nextProducts = Array.isArray(payload?.products) ? payload.products : [];

        if (!cancelled) {
          setRemoteResults(nextProducts);
          onProductsLoaded(nextProducts);
        }
      } catch {
        if (!cancelled) {
          setRemoteResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [onProductsLoaded, query]);

  const visibleProducts = useMemo(() => {
    if (query.trim()) {
      return remoteResults;
    }

    return products.slice(0, 24);
  }, [products, query, remoteResults]);

  const manualSelectedProducts = useMemo(() => {
    const productsById = new Map(products.map((product) => [product.id, product] as const));

    return manualSelectionProductIds
      .map((productId) => productsById.get(productId) ?? null)
      .filter((product): product is MerchantPreviewProduct => Boolean(product));
  }, [manualSelectionProductIds, products]);

  return (
    <Card className="border-white/8 bg-white/[0.03]">
      <CardHeader className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100">
          <WandSparkles className="h-3.5 w-3.5" />
          Auditor en vivo
        </div>
        <CardTitle className="text-2xl">Simular producto semilla</CardTitle>
        <CardDescription>
          Elegi un producto real de la tienda para ver como responde el motor antes de publicar.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
          {isSearching ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200" />
          ) : (
            <Search className="h-4 w-4 text-slate-400" />
          )}
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar producto por nombre"
            type="text"
            value={query}
          />
        </label>

        {recommendationAlgorithm === "seleccion-manual" ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Seleccion manual</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">
              Los productos que agregues aca quedan fijados para esta tienda y se usan en el widget
              real cuando la estrategia activa es manual.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {manualSelectedProducts.length > 0 ? (
                manualSelectedProducts.map((product) => (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-950/70 px-3 py-1 text-xs text-cyan-100"
                    key={product.id}
                  >
                    {product.name}
                    <button
                      className="text-cyan-200 transition hover:text-white"
                      onClick={() => onToggleManualProduct(product.id)}
                      type="button"
                    >
                      Quitar
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-300">
                  Todavia no agregaste productos manuales.
                </span>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {visibleProducts.map((product) => {
            const isActive = product.id === selectedProductId;
            const isManualSelected = manualSelectionProductIds.includes(product.id);

            return (
              <article
                className={cn(
                  "grid gap-3 rounded-2xl border px-4 py-4 text-left transition",
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/10"
                    : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]",
                )}
                key={product.id}
              >
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Product ID #{product.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onSelectProduct(product.id)}
                    size="sm"
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                  >
                    {isActive ? "Semilla activa" : "Usar como semilla"}
                  </Button>
                  {recommendationAlgorithm === "seleccion-manual" ? (
                    <Button
                      onClick={() => onToggleManualProduct(product.id)}
                      size="sm"
                      type="button"
                      variant={isManualSelected ? "secondary" : "ghost"}
                    >
                      {isManualSelected ? "Quitar de manual" : "Agregar a manual"}
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        {query.trim() && !isSearching && visibleProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-4 py-5 text-sm text-slate-300">
            No encontramos productos para esa busqueda.
          </div>
        ) : null}

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Preview API</p>
            <p className="mt-2 break-all">{previewApiUrl}</p>
          </div>
          {storefrontUrl ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pagina de test</p>
              <p className="mt-2 break-all">{storefrontUrl}</p>
            </div>
          ) : null}
          {storefrontUrl ? (
            <Button
              asChild
              className="w-full sm:w-auto !text-slate-950 shadow-[0_16px_40px_-22px_rgba(86,226,243,0.95)]"
            >
              <a href={storefrontUrl} rel="noreferrer" target="_blank">
                Abrir storefront
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
