"use client";

import { Boxes, BrainCircuit, Wand2 } from "lucide-react";

import { ESTRATEGIAS, type StrategyValue } from "@/components/dashboard/types";
import { cn } from "@/lib/utils";

const strategyIcons: Record<StrategyValue, typeof BrainCircuit> = {
  "comprados-juntos": Boxes,
  "ia-inteligente": BrainCircuit,
  "seleccion-manual": Wand2,
};

type StrategySelectorProps = {
  onValueChange: (value: StrategyValue) => void;
  value: StrategyValue;
};

export const StrategySelector = ({ onValueChange, value }: StrategySelectorProps) => {
  return (
    <div className="grid gap-3">
      {ESTRATEGIAS.map((strategy) => {
        const Icon = strategyIcons[strategy.valor];
        const isActive = strategy.valor === value;

        return (
          <button
            className={cn(
              "grid gap-2 rounded-[22px] border px-4 py-4 text-left transition",
              isActive
                ? "border-cyan-300/40 bg-cyan-300/10 shadow-[0_0_48px_-30px_rgba(86,226,243,0.9)]"
                : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
            )}
            key={strategy.valor}
            onClick={() => onValueChange(strategy.valor)}
            type="button"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
                    isActive
                      ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-white/[0.04] text-slate-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{strategy.etiqueta}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {isActive ? "Activa" : "Disponible"}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full border text-[11px]",
                  isActive
                    ? "border-cyan-300/40 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-slate-400",
                )}
              >
                {isActive ? "ON" : "•"}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-300">{strategy.descripcion}</p>
          </button>
        );
      })}
    </div>
  );
};
