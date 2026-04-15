import Link from "next/link";
import { ArrowUpRight, Sparkles, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PerformanceMetric = {
  aov: number;
  conversionRate: number;
  label: string;
};

type OpportunityInsight = {
  anchorProduct: string;
  projectedLift: number;
  relatedProduct: string;
};

export type ProfitFirstSummaryProps = {
  effectivenessDelta: number;
  opportunity: OpportunityInsight | null;
  organic: PerformanceMetric;
  subscriptionCost: number;
  vortex: PerformanceMetric;
  vortexRevenue: number;
};

const formatCurrencyArs = (value: number): string => {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}%`;
};

const ComparisonRow = ({
  metric,
  tone,
}: {
  metric: PerformanceMetric;
  tone: "organic" | "vortex";
}) => {
  const barWidth = Math.max(16, Math.min(100, metric.conversionRate * 12));

  return (
    <div className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{metric.label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {tone === "vortex" ? "Empuje asistido" : "Base organica"}
          </p>
        </div>
        <Badge tone={tone === "vortex" ? "success" : "info"}>
          {tone === "vortex" ? "Vortex" : "Organica"}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Ticket promedio
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCurrencyArs(metric.aov)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Tasa de conversion
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {metric.conversionRate.toFixed(1).replace(".", ",")}%
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/6">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "vortex" ? "bg-[#56E2F3]" : "bg-white/45",
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};

export const ProfitFirstSummary = ({
  effectivenessDelta,
  opportunity,
  organic,
  subscriptionCost,
  vortex,
  vortexRevenue,
}: ProfitFirstSummaryProps) => {
  const netLift = Math.max(vortexRevenue - subscriptionCost, 0);

  return (
    <Card className="overflow-hidden border-[#56E2F3]/10 bg-[linear-gradient(180deg,rgba(3,10,18,0.98),rgba(6,13,21,0.96))]">
      <CardHeader className="border-b border-white/6 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Badge tone="success">Profit-first / Terminal financiera</Badge>
            <div>
              <CardTitle className="text-3xl tracking-[-0.04em] text-white">
                Ganancia Extra Generada por Vortex
              </CardTitle>
              <CardDescription className="max-w-2xl text-slate-300">
                Ingresos atribuidos menos costo de suscripcion: el numero que le demuestra al
                merchant por que conviene mantener Vortex encendido.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Suscripcion</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrencyArs(subscriptionCost)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#56E2F3]/20 bg-[#56E2F3]/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100">
                Ventas atribuidas a Vortex
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatCurrencyArs(vortexRevenue)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-4 rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Ganancia neta atribuida
              </p>
              <p className="mt-4 text-5xl font-black tracking-[-0.06em] text-white">
                {formatCurrencyArs(netLift)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-100">
                ROI real
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatPercentage(effectivenessDelta)}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ComparisonRow metric={organic} tone="organic" />
            <ComparisonRow metric={vortex} tone="vortex" />
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3">
            <WalletCards className="h-4 w-4 text-emerald-100" />
            <span className="text-sm text-emerald-50">
              {formatPercentage(effectivenessDelta)} Efectividad sobre la venta organica.
            </span>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Cazador de oportunidades
            </p>
            {opportunity ? (
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl border border-[#56E2F3]/20 bg-[#56E2F3]/10 p-4">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.24em]">
                      Insight accionable
                    </span>
                  </div>
                  <p className="mt-4 text-base leading-7 text-white">
                    Vortex detecto que si recomendas{" "}
                    <span className="font-semibold text-cyan-100">
                      {opportunity.anchorProduct}
                    </span>{" "}
                    con{" "}
                    <span className="font-semibold text-cyan-100">
                      {opportunity.relatedProduct}
                    </span>
                    , podrias ganar un{" "}
                    <span className="font-semibold text-cyan-100">
                      {formatPercentage(opportunity.projectedLift)}
                    </span>{" "}
                    mas este mes.
                  </p>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <Link href="#configuracion-widget">
                    Activar Recomendacion
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Todavia no hay un par destacado. Apenas Vortex detecte una oportunidad clara, la
                vas a ver aca con CTA directo.
              </p>
            )}
          </div>

          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              Contexto A/B
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/8">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Canal</th>
                    <th className="px-4 py-3">AOV</th>
                    <th className="px-4 py-3">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/6">
                    <td className="px-4 py-3 text-white">Venta Organica</td>
                    <td className="px-4 py-3">{formatCurrencyArs(organic.aov)}</td>
                    <td className="px-4 py-3">
                      {organic.conversionRate.toFixed(1).replace(".", ",")}%
                    </td>
                  </tr>
                  <tr className="border-t border-white/6 bg-[#56E2F3]/6">
                    <td className="px-4 py-3 text-white">Venta con Vortex (FBT/IA)</td>
                    <td className="px-4 py-3">{formatCurrencyArs(vortex.aov)}</td>
                    <td className="px-4 py-3">
                      {vortex.conversionRate.toFixed(1).replace(".", ",")}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
