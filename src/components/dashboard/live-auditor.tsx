"use client";

import { useMemo, useState } from "react";
import { Search, WandSparkles } from "lucide-react";

import type { MerchantPreviewProduct } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LiveAuditorProps = {
  onSelectProduct: (productId: number) => void;
  previewApiUrl: string;
  products: MerchantPreviewProduct[];
  selectedProductId: number | null;
  storefrontUrl: string | null;
};

export const LiveAuditor = ({
  onSelectProduct,
  previewApiUrl,
  products,
  selectedProductId,
  storefrontUrl,
}: LiveAuditorProps) => {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products.slice(0, 6);
    }

    return products
      .filter((product) => {
        return product.name.toLowerCase().includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [products, query]);

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
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar producto por nombre"
            type="text"
            value={query}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {filteredProducts.map((product) => {
            const isActive = product.id === selectedProductId;

            return (
              <button
                className={cn(
                  "grid gap-1 rounded-2xl border px-4 py-4 text-left transition",
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300/10"
                    : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]",
                )}
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                type="button"
              >
                <p className="text-sm font-medium text-white">{product.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Product ID #{product.id}
                </p>
              </button>
            );
          })}
        </div>

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
