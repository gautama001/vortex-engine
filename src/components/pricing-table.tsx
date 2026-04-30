"use client";

import { useMemo, useState } from "react";

type PricingPlan = {
  base: number;
  description: string;
  disabled: string[];
  enabled: string[];
  fee: number;
  highlight?: boolean;
  priceLabel: string;
  subtitle: string;
  title: string;
  trial?: string;
};

const plans: PricingPlan[] = [
  {
    base: 24900,
    description: "Para tiendas que arrancan a optimizar.",
    disabled: ["IA Engine semantico", "Seleccion manual", "Terminal financiera de ROI"],
    enabled: [
      "Widget Maestro (PDP / Carrito)",
      "Algoritmo FBT (Comprados juntos)",
      "Panel de branding",
      "Guardado optimista",
    ],
    fee: 0.015,
    priceLabel: "$24.900 ARS/mes + 1.5% Success Fee",
    subtitle: "Core",
    title: "Plan Core",
    trial: "14 dias gratis",
  },
  {
    base: 42300,
    description: "Optimizacion inteligente y control editorial.",
    disabled: ["Terminal financiera de ROI neta", "Cazador de oportunidades"],
    enabled: [
      "Todo lo de Core",
      "IA Engine (senales semanticas)",
      "Seleccion manual de productos",
      "Reglas de inventario",
      "Iframe preview en tiempo real",
    ],
    fee: 0.012,
    highlight: true,
    priceLabel: "$42.300 ARS/mes + 1.2% Success Fee",
    subtitle: "Pro",
    title: "Plan Pro",
  },
  {
    base: 70500,
    description: "Terminal financiera y escala total.",
    disabled: [],
    enabled: [
      "Todo lo de Pro",
      "Dashboard de Ganancia Neta Atribuida",
      "Auditor de API en vivo",
      "Analytics Funnel (Clicks / Conv)",
      "Insights Cazador de Oportunidades",
    ],
    fee: 0.008,
    priceLabel: "$70.500 ARS/mes + 0.8% Success Fee",
    subtitle: "Elite",
    title: "Plan Elite",
  },
];

function formatCurrency(value: number) {
  return value.toLocaleString("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  });
}

export function PricingTable() {
  const [monthlyRevenue, setMonthlyRevenue] = useState("5000000");

  const roi = useMemo(() => {
    const revenue = Number(monthlyRevenue.replace(/[^\d]/g, "")) || 0;
    const pro = plans[1]!;
    const cost = pro.base + revenue * pro.fee;
    const projectedGain = revenue * 0.18;
    const netGain = projectedGain - cost;
    const roiPercent = cost > 0 ? (netGain / cost) * 100 : 0;

    return {
      cost,
      netGain,
      projectedGain,
      revenue,
      roiPercent,
    };
  }, [monthlyRevenue]);

  return (
    <div className="space-y-10" style={{ fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif' }}>
      <div className="grid gap-6 xl:grid-cols-3">
        {plans.map((plan) => (
          <article
            className={`relative flex h-full flex-col rounded-[30px] border p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.55)] ${
              plan.highlight
                ? "border-cyan-300/45 bg-[#121b2a] ring-1 ring-cyan-300/35"
                : "border-white/8 bg-[#111827]"
            }`}
            key={plan.title}
          >
            {plan.highlight ? (
              <span className="absolute right-6 top-6 rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Mas popular
              </span>
            ) : null}

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">{plan.subtitle}</p>
              <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white">{plan.title}</h3>
              <p className="text-sm leading-6 text-slate-300">{plan.description}</p>
              <p className="text-xl font-semibold tracking-[-0.03em] text-white">{plan.priceLabel}</p>
              {plan.trial ? (
                <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {plan.trial}
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Alcance comercial del plan
              </p>
              <ul className="grid gap-3">
                {plan.enabled.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-slate-100" key={item}>
                    <span className="mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/15 text-cyan-200">
                      +
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
                {plan.disabled.map((item) => (
                  <li className="flex gap-3 text-sm leading-6 text-slate-400" key={item}>
                    <span className="mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-slate-500">
                      -
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                  plan.highlight
                    ? "border border-cyan-300/40 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                    : "border border-slate-200/20 bg-slate-700/70 text-white hover:border-cyan-300/45 hover:bg-slate-600/80"
                }`}
                href="/api/auth/install"
              >
                Empezar con {plan.subtitle}
              </a>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-[34px] border border-white/8 bg-[#0f1726] p-6 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.55)] sm:p-8">
        <div className="grid gap-7 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Calculadora ROI</p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white">
              Estima cuanto te costaria Vortex Pro y cuanta ganancia extra podria dejarte.
            </h3>
            <p className="text-sm leading-7 text-slate-300">
              Usamos el benchmark actual del Command Center: una mejora proyectada del 18% sobre la facturacion mensual para mostrar costo, ganancia atribuida y retorno estimado.
            </p>

            <label className="grid gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Facturacion mensual de la tienda
              </span>
              <input
                className="h-14 rounded-2xl border border-white/10 bg-[#0A0F1A] px-4 text-lg font-medium text-white outline-none transition focus:border-cyan-300/55 focus:ring-4 focus:ring-cyan-300/15"
                inputMode="numeric"
                onChange={(event) => setMonthlyRevenue(event.target.value)}
                placeholder="5000000"
                type="text"
                value={monthlyRevenue}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <RoiCard label="Facturacion mensual" value={formatCurrency(roi.revenue)} />
            <RoiCard label="Costo Vortex Pro" value={formatCurrency(roi.cost)} />
            <RoiCard accent label="Ganancia extra estimada" value={formatCurrency(roi.projectedGain)} />
            <RoiCard
              accent
              label="ROI proyectado"
              value={`${roi.roiPercent >= 0 ? "+" : ""}${roi.roiPercent.toFixed(0)}%`}
            />
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-cyan-300/18 bg-cyan-300/8 p-5 text-sm leading-7 text-slate-200">
          Con una facturacion de <strong className="text-white">{formatCurrency(roi.revenue)}</strong>, el plan Pro
          proyecta una ganancia extra de{" "}
          <strong className="text-cyan-200">{formatCurrency(roi.projectedGain)}</strong>. Despues de restar el costo
          estimado de Vortex ({formatCurrency(roi.cost)}), quedaria una mejora neta aproximada de{" "}
          <strong className={roi.netGain >= 0 ? "text-emerald-300" : "text-rose-300"}>
            {formatCurrency(roi.netGain)}
          </strong>
          .
        </div>
      </section>
    </div>
  );
}

function RoiCard({ accent = false, label, value }: { accent?: boolean; label: string; value: string }) {
  return (
    <div
      className={`rounded-[24px] border p-4 ${
        accent ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/8 bg-white/5"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-[-0.04em] ${accent ? "text-cyan-200" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
