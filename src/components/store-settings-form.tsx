"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialUpdateStoreSettingsState,
  type UpdateStoreSettingsState,
  updateStoreSettingsAction,
} from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import type { StoreWidgetSettings } from "@/services/store-service";

type StoreSettingsFormProps = {
  initialSettings: StoreWidgetSettings;
};

const submitLabelByStatus: Record<UpdateStoreSettingsState["status"], string> = {
  error: "Guardar cambios",
  idle: "Guardar cambios",
  success: "Guardar cambios",
};

const SaveButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" size="lg" type="submit">
      {pending ? "Guardando..." : "Guardar cambios"}
    </Button>
  );
};

const CheckboxRow = ({
  defaultChecked,
  description,
  name,
  title,
}: {
  defaultChecked: boolean;
  description: string;
  name: string;
  title: string;
}) => {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <input
        className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-cyan-300"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      <span className="grid gap-1">
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="text-sm leading-6 text-slate-300">{description}</span>
      </span>
    </label>
  );
};

export const StoreSettingsForm = ({ initialSettings }: StoreSettingsFormProps) => {
  const [state, formAction] = useActionState(updateStoreSettingsAction, initialUpdateStoreSettingsState);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <CheckboxRow
          defaultChecked={initialSettings.widgetEnabled}
          description="Apaga o prende todo el widget storefront sin desinstalar la app."
          name="widget_enabled"
          title="Widget activo"
        />
        <CheckboxRow
          defaultChecked={initialSettings.productPageEnabled}
          description="Renderiza recomendaciones en la pagina de producto."
          name="product_page_enabled"
          title="Mostrar en producto"
        />
        <CheckboxRow
          defaultChecked={initialSettings.cartPageEnabled}
          description="Renderiza recomendaciones dentro del carrito si hay items."
          name="cart_page_enabled"
          title="Mostrar en carrito"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_120px]">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Titulo</span>
          <input
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.08]"
            defaultValue={initialSettings.widgetTitle}
            maxLength={96}
            name="widget_title"
            type="text"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Cantidad</span>
          <input
            className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.08]"
            defaultValue={initialSettings.recommendationLimit}
            max={8}
            min={1}
            name="recommendation_limit"
            type="number"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Subtitulo</span>
        <textarea
          className="min-h-28 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.08]"
          defaultValue={initialSettings.widgetSubtitle}
          maxLength={180}
          name="widget_subtitle"
        />
      </label>

      <label className="grid gap-2 md:max-w-[220px]">
        <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Texto del CTA</span>
        <input
          className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/[0.08]"
          defaultValue={initialSettings.quickAddLabel}
          maxLength={24}
          name="quick_add_label"
          type="text"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={
            state.status === "success"
              ? "text-sm text-emerald-200"
              : state.status === "error"
                ? "text-sm text-rose-200"
                : "text-sm text-slate-400"
          }
        >
          {state.message || "Guarda cambios y recarga la tienda para probar el storefront."}
        </p>
        <SaveButton />
      </div>
    </form>
  );
};
