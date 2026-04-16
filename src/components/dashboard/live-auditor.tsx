"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Search, Sparkles, WandSparkles } from "lucide-react";

import type {
  MerchantPreviewProduct,
  StrategyValue,
} from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  hasMore?: boolean;
  page?: number;
  products?: MerchantPreviewProduct[];
};

const PAGE_SIZE = 8;

const parseJsonSafely = <T,>(rawValue: string): T | null => {
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const fetchProductBatch = async (input: {
  page?: number;
  query?: string;
}): Promise<{
  hasMore: boolean;
  page: number;
  products: MerchantPreviewProduct[];
}> => {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    page: String(input.page ?? 1),
  });

  if (input.query?.trim()) {
    params.set("query", input.query.trim());
  }

  const response = await fetch(`/api/v1/store/products?${params.toString()}`, {
    cache: "no-store",
    credentials: "same-origin",
  });
  const rawPayload = await response.text();
  const payload = parseJsonSafely<ProductSearchPayload>(rawPayload);

  return {
    hasMore: Boolean(payload?.hasMore),
    page:
      typeof payload?.page === "number" && Number.isFinite(payload.page)
        ? payload.page
        : input.page ?? 1,
    products: Array.isArray(payload?.products) ? payload.products : [],
  };
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
  const [catalogHasMore, setCatalogHasMore] = useState(
    products.length >= PAGE_SIZE,
  );
  const [catalogPage, setCatalogPage] = useState(
    Math.max(1, Math.ceil(products.length / PAGE_SIZE)),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<MerchantPreviewProduct[]>(
    [],
  );
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const loadMoreAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCatalogPage(Math.max(1, Math.ceil(products.length / PAGE_SIZE)));
    setCatalogHasMore(products.length >= PAGE_SIZE);
  }, [products.length]);

  const loadSearchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        setRemoteResults([]);
        setSearchPage(1);
        setSearchHasMore(false);
        return;
      }

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsSearching(true);
        }

        const payload = await fetchProductBatch({
          page: nextPage,
          query: normalizedQuery,
        });

        setRemoteResults((currentResults) =>
          append ? [...currentResults, ...payload.products] : payload.products,
        );
        setSearchPage(payload.page);
        setSearchHasMore(payload.hasMore);
        onProductsLoaded(payload.products);
      } catch {
        if (!append) {
          setRemoteResults([]);
        }
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    },
    [onProductsLoaded, query],
  );

  const loadCatalogPage = useCallback(async () => {
    try {
      setIsLoadingMore(true);
      const nextPage = catalogPage + 1;
      const payload = await fetchProductBatch({
        page: nextPage,
      });

      onProductsLoaded(payload.products);
      setCatalogPage(payload.page);
      setCatalogHasMore(payload.hasMore);
    } catch {
      setCatalogHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [catalogPage, onProductsLoaded]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setRemoteResults([]);
      setSearchPage(1);
      setSearchHasMore(false);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      if (cancelled) {
        return;
      }

      await loadSearchPage(1, false);
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [loadSearchPage, query]);

  const visibleProducts = useMemo(() => {
    if (query.trim()) {
      return remoteResults;
    }

    return products;
  }, [products, query, remoteResults]);

  const productPool = useMemo(() => {
    return [
      ...new Map(
        [...products, ...remoteResults].map((product) => [product.id, product] as const),
      ).values(),
    ];
  }, [products, remoteResults]);

  const selectedSeedProduct = useMemo(() => {
    if (!selectedProductId) {
      return null;
    }

    return productPool.find((product) => product.id === selectedProductId) ?? null;
  }, [productPool, selectedProductId]);

  const manualSelectedProducts = useMemo(() => {
    const productsById = new Map(
      productPool.map((product) => [product.id, product] as const),
    );

    return manualSelectionProductIds
      .map((productId) => productsById.get(productId) ?? null)
      .filter((product): product is MerchantPreviewProduct => Boolean(product));
  }, [manualSelectionProductIds, productPool]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) {
      return;
    }

    if (query.trim()) {
      if (searchHasMore) {
        await loadSearchPage(searchPage + 1, true);
      }

      return;
    }

    if (catalogHasMore) {
      await loadCatalogPage();
    }
  }, [
    catalogHasMore,
    isLoadingMore,
    loadCatalogPage,
    loadSearchPage,
    query,
    searchHasMore,
    searchPage,
  ]);

  useEffect(() => {
    const anchor = loadMoreAnchorRef.current;

    if (!anchor) {
      return;
    }

    const shouldObserve = query.trim() ? searchHasMore : catalogHasMore;

    if (!shouldObserve) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void handleLoadMore();
        }
      },
      {
        rootMargin: "180px 0px",
      },
    );

    observer.observe(anchor);

    return () => {
      observer.disconnect();
    };
  }, [catalogHasMore, handleLoadMore, query, searchHasMore, visibleProducts.length]);

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
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">
              Semilla activa
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-100">
              {selectedSeedProduct
                ? `${selectedSeedProduct.name} - Product ID #${selectedSeedProduct.id}`
                : "Todavia no seleccionaste un producto semilla para el preview."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Seleccion manual
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {recommendationAlgorithm === "seleccion-manual"
                ? "Estos productos alimentan la estrategia activa y desplazan a la grilla automatica en la vista previa."
                : "Podes preparar una lista manual ahora y activarla mas adelante cuando cambies la estrategia."}
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
        </div>

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
                    : isManualSelected
                      ? "border-cyan-300/20 bg-cyan-400/[0.06]"
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
                    variant={isActive ? "primary" : "secondary"}
                  >
                    {isActive ? "Semilla activa" : "Usar como semilla"}
                  </Button>
                  <Button
                    onClick={() => onToggleManualProduct(product.id)}
                    size="sm"
                    type="button"
                    variant={isManualSelected ? "primary" : "secondary"}
                  >
                    {isManualSelected ? "Agregado a manual" : "Agregar a manual"}
                  </Button>
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

        {(query.trim() ? searchHasMore : catalogHasMore) ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-2 w-full" ref={loadMoreAnchorRef} />
            <Button onClick={() => void handleLoadMore()} type="button" variant="ghost">
              {isLoadingMore ? "Cargando mas productos..." : "Cargar mas productos"}
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Preview API
            </p>
            <p className="mt-2 break-all">{previewApiUrl}</p>
          </div>
          {storefrontUrl ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Pagina de test
              </p>
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
