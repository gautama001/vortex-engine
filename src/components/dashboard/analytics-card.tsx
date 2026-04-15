"use client";

import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalyticsCardProps = {
  etiqueta: string;
  porcentaje?: string;
  tono?: "neutral" | "positivo";
  valor: string;
};

export const AnalyticsCard = ({
  etiqueta,
  porcentaje,
  tono = "neutral",
  valor,
}: AnalyticsCardProps) => {
  return (
    <Card className="border-white/8 bg-white/[0.03]">
      <CardContent className="grid gap-4 p-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{etiqueta}</p>
        <div className="flex items-end justify-between gap-3">
          <p className="text-[2.15rem] font-semibold tracking-[-0.04em] text-white">{valor}</p>
          {porcentaje ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium",
                tono === "positivo"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "border-white/10 bg-white/[0.04] text-slate-300",
              )}
            >
              {tono === "positivo" ? <TrendingUp className="h-3.5 w-3.5" /> : null}
              {porcentaje}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
