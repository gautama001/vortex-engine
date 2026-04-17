"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  MonitorSmartphone,
  Paintbrush,
  RotateCcw,
  ShoppingCart,
  SlidersHorizontal,
  Type,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { StrategySelector } from "@/components/dashboard/strategy-selector";
import {
  DESKTOP_COLUMN_OPTIONS,
  DISCOUNT_PERCENTAGE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  MOBILE_COLUMN_OPTIONS,
  REGLAS_DE_INVENTARIO,
  type MerchantWidgetConfig,
} from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfigurationFormProps = {
  manualSelectionProductIds: number[];
  onConfigChange: (config: MerchantWidgetConfig) => void;
  onSaved: (config: MerchantWidgetConfig, updatedAt: string) => void;
  savedConfig: MerchantWidgetConfig;
  storeId: string;
};

type SaveStatus =
  | {
      kind: "error" | "success";
      message: string;
    }
  | null;

type SavePayload = {
  config?: MerchantWidgetConfig;
  message?: string;
  updatedAt?: string;
};

const parseJsonSafely = <T,>(rawValue: string): T | null => {
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const sectionTitleClass = "text-xs uppercase tracking-[0.28em] text-slate-500";
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const darkOptionStyle = {
  backgroundColor: "#0b1220",
  color: "#e5eef5",
};

const normalizeHexInput = (value: string): string => {
  if (!value) {
    return "#0A0F1A";
  }

  return value.startsWith("#") ? value.toUpperCase() : `#${value.toUpperCase()}`;
};

const isValidHexColor = (value: string): boolean => {
  return HEX_COLOR_PATTERN.test(normalizeHexInput(value));
};

const PlacementToggle = ({
  description,
  isActive,
  label,
}: {
  description: string;
  isActive: boolean;
  label: string;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
        isActive ? "border-cyan-300/35 bg-cyan-400/10" : "border-white/10 bg-white/[0.03]",
      )}
    >
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <span
        className={cn(
          "inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
          isActive ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-300",
        )}
      >
        {isActive ? "On" : "Off"}
      </span>
    </div>
  );
};

export const ConfigurationForm = ({
  manualSelectionProductIds,
  onConfigChange,
  onSaved,
  savedConfig,
  storeId,
}: ConfigurationFormProps) => {
  const [accentColorDraft, setAccentColorDraft] = useState(savedConfig.accentColor);
  const [backgroundColorDraft, setBackgroundColorDraft] = useState(savedConfig.backgroundColor);
  const [fontColorDraft, setFontColorDraft] = useState(savedConfig.fontColor);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register: registerField,
    register,
    reset,
    setValue,
  } = useForm<MerchantWidgetConfig>({
    defaultValues: savedConfig,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control });
  const liveConfig = useMemo<MerchantWidgetConfig>(() => {
    return {
      ...savedConfig,
      ...watchedValues,
      accentColor: normalizeHexInput(watchedValues.accentColor ?? savedConfig.accentColor),
      backgroundColor: normalizeHexInput(
        watchedValues.backgroundColor ?? savedConfig.backgroundColor,
      ),
      borderRadius: Number(watchedValues.borderRadius ?? savedConfig.borderRadius),
      desktopColumns: Number(
        watchedValues.desktopColumns ?? savedConfig.desktopColumns,
      ) as MerchantWidgetConfig["desktopColumns"],
      discountPercentage: Number(
        watchedValues.discountPercentage ?? savedConfig.discountPercentage,
      ) as MerchantWidgetConfig["discountPercentage"],
      fontColor: normalizeHexInput(watchedValues.fontColor ?? savedConfig.fontColor),
      fontFamily: watchedValues.fontFamily ?? savedConfig.fontFamily,
      manualRecommendationProductIds:
        manualSelectionProductIds ??
        watchedValues.manualRecommendationProductIds ??
        savedConfig.manualRecommendationProductIds,
      mobileColumns: Number(
        watchedValues.mobileColumns ?? savedConfig.mobileColumns,
      ) as MerchantWidgetConfig["mobileColumns"],
      recommendationLimit: Number(
        watchedValues.recommendationLimit ?? savedConfig.recommendationLimit,
      ),
      recommendationAlgorithm:
        watchedValues.recommendationAlgorithm ?? savedConfig.recommendationAlgorithm,
      requireImage: watchedValues.requireImage ?? savedConfig.requireImage,
      hideOutOfStock: watchedValues.hideOutOfStock ?? savedConfig.hideOutOfStock,
    };
  }, [savedConfig, watchedValues]);

  useEffect(() => {
    registerField("manualRecommendationProductIds");
  }, [registerField]);

  useEffect(() => {
    reset(savedConfig);
    onConfigChange(savedConfig);
  }, [onConfigChange, reset, savedConfig]);

  useEffect(() => {
    setBackgroundColorDraft(savedConfig.backgroundColor);
    setAccentColorDraft(savedConfig.accentColor);
    setFontColorDraft(savedConfig.fontColor);
  }, [savedConfig.accentColor, savedConfig.backgroundColor, savedConfig.fontColor]);

  useEffect(() => {
    setValue("manualRecommendationProductIds", manualSelectionProductIds, {
      shouldDirty: true,
    });
  }, [manualSelectionProductIds, setValue]);

  useEffect(() => {
    onConfigChange({
      ...liveConfig,
      borderRadius: Number.isFinite(liveConfig.borderRadius) ? liveConfig.borderRadius : 24,
      recommendationLimit: Number.isFinite(liveConfig.recommendationLimit)
        ? liveConfig.recommendationLimit
        : 4,
    });
  }, [liveConfig, onConfigChange]);

  const submitHandler = handleSubmit(async (values) => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch("/api/v1/store/config", {
        cache: "no-store",
        body: JSON.stringify({
          config: values,
          storeId,
        }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const rawPayload = await response.text();
      const payload = parseJsonSafely<SavePayload>(rawPayload);
      const nextConfig = payload?.config;
      const nextUpdatedAt = payload?.updatedAt;

      if (!response.ok || !nextConfig || !nextUpdatedAt) {
        if (!payload) {
          throw new Error(
            `El runtime devolvio una respuesta invalida (${response.status}). Revisa el deploy o la sesion y volve a intentar.`,
          );
        }

        throw new Error(payload.message || "No pudimos guardar la configuracion.");
      }

      reset(nextConfig);
      onSaved(nextConfig, nextUpdatedAt);
      setSaveStatus({
        kind: "success",
        message: "Cambios publicados. El storefront ya puede usar esta configuracion.",
      });
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos guardar la configuracion. Verifica la sesion y vuelve a intentar.",
      });
    } finally {
      setIsSaving(false);
    }
  });

  const discardChanges = () => {
    reset(savedConfig);
    setBackgroundColorDraft(savedConfig.backgroundColor);
    setAccentColorDraft(savedConfig.accentColor);
    setFontColorDraft(savedConfig.fontColor);
    setSaveStatus(null);
    onConfigChange(savedConfig);
  };

  const applyColorDraft = (field: "accentColor" | "backgroundColor" | "fontColor") => {
    const nextValue =
      field === "backgroundColor"
        ? backgroundColorDraft
        : field === "fontColor"
          ? fontColorDraft
          : accentColorDraft;
    const normalizedValue = normalizeHexInput(nextValue);

    if (!isValidHexColor(normalizedValue)) {
      setSaveStatus({
        kind: "error",
        message: "Usa colores hex validos, por ejemplo #0A0F1A o #58E2F3.",
      });
      return;
    }

    setSaveStatus(null);
    setValue(field, normalizedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (field === "backgroundColor") {
      setBackgroundColorDraft(normalizedValue);
      return;
    }

    if (field === "fontColor") {
      setFontColorDraft(normalizedValue);
      return;
    }

    setAccentColorDraft(normalizedValue);
  };

  return (
    <form className="grid gap-6" onSubmit={submitHandler}>
      <section className="grid gap-4 rounded-[26px] border border-white/8 bg-slate-950/45 p-5">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-cyan-300" />
          <p className={sectionTitleClass}>Estrategia</p>
        </div>
        <StrategySelector
          onValueChange={(value) => {
            setValue("recommendationAlgorithm", value, { shouldDirty: true, shouldTouch: true });
          }}
          value={liveConfig.recommendationAlgorithm}
        />
      </section>

      <section className="grid gap-4 rounded-[26px] border border-white/8 bg-slate-950/45 p-5">
        <div className="flex items-center gap-3">
          <Paintbrush className="h-4 w-4 text-cyan-300" />
          <p className={sectionTitleClass}>Branding</p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Color de fondo</span>
            <input
              type="hidden"
              {...register("backgroundColor", {
                pattern: HEX_COLOR_PATTERN,
              })}
            />
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <input
                  className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                  type="color"
                  onChange={(event) => setBackgroundColorDraft(event.target.value.toUpperCase())}
                  value={backgroundColorDraft}
                />
                <input
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none"
                  type="text"
                  onChange={(event) => setBackgroundColorDraft(event.target.value.toUpperCase())}
                  value={backgroundColorDraft}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => applyColorDraft("backgroundColor")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Aplicar color
              </Button>
            </div>
            <span className="text-xs text-slate-500">
              Si usas la pipeta del selector, confirma el cambio con "Aplicar color".
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Color de acento</span>
            <input
              type="hidden"
              {...register("accentColor", {
                pattern: HEX_COLOR_PATTERN,
              })}
            />
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <input
                  className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                  type="color"
                  onChange={(event) => setAccentColorDraft(event.target.value.toUpperCase())}
                  value={accentColorDraft}
                />
                <input
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none"
                  type="text"
                  onChange={(event) => setAccentColorDraft(event.target.value.toUpperCase())}
                  value={accentColorDraft}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => applyColorDraft("accentColor")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Aplicar color
              </Button>
            </div>
            <span className="text-xs text-slate-500">
              Si usas la pipeta del selector, confirma el cambio con "Aplicar color".
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Color de fuente</span>
            <input
              type="hidden"
              {...register("fontColor", {
                pattern: HEX_COLOR_PATTERN,
              })}
            />
            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <input
                  className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent"
                  type="color"
                  onChange={(event) => setFontColorDraft(event.target.value.toUpperCase())}
                  value={fontColorDraft}
                />
                <input
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white outline-none"
                  type="text"
                  onChange={(event) => setFontColorDraft(event.target.value.toUpperCase())}
                  value={fontColorDraft}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => applyColorDraft("fontColor")}
                size="sm"
                type="button"
                variant="secondary"
              >
                Aplicar color
              </Button>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Tipografia</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
              style={{ colorScheme: "dark" }}
              {...register("fontFamily")}
            >
              {FONT_FAMILY_OPTIONS.map((option) => (
                <option key={option.valor} style={darkOptionStyle} value={option.valor}>
                  {option.etiqueta}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">
              Opciones acotadas para mantener la beta prolija y congruente con storefront.
            </span>
          </label>
        </div>

        <label className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Border radius</span>
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">
              {liveConfig.borderRadius}px
            </span>
          </div>
          <input
            className="h-2 cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
            max={32}
            min={8}
            type="range"
            {...register("borderRadius", {
              valueAsNumber: true,
            })}
          />
        </label>
      </section>

      <section className="grid gap-4 rounded-[26px] border border-white/8 bg-slate-950/45 p-5">
        <div className="flex items-center gap-3">
          <Type className="h-4 w-4 text-cyan-300" />
          <p className={sectionTitleClass}>Copy y reglas</p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Titulo</span>
            <input
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
              type="text"
              {...register("widgetTitle", {
                required: true,
                maxLength: 96,
              })}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Subtitulo</span>
            <textarea
              className="min-h-28 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none"
              {...register("widgetSubtitle", {
                required: true,
                maxLength: 180,
              })}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Texto del CTA</span>
              <input
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
                type="text"
                {...register("quickAddLabel", {
                  required: true,
                  maxLength: 24,
                })}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Productos</span>
              <input
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
                max={8}
                min={1}
                type="number"
                {...register("recommendationLimit", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Descuento visual</span>
            <select
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
              style={{ colorScheme: "dark" }}
              {...register("discountPercentage", {
                valueAsNumber: true,
              })}
            >
              {DISCOUNT_PERCENTAGE_OPTIONS.map((option) => (
                <option key={option} style={darkOptionStyle} value={option}>
                  {option === 0 ? "Sin descuento" : `${option}% OFF`}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">
              Visual merchandising para la card. No altera todavia el precio transaccional del checkout.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Columnas desktop</span>
              <select
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
                style={{ colorScheme: "dark" }}
                {...register("desktopColumns", {
                  valueAsNumber: true,
                })}
              >
                {DESKTOP_COLUMN_OPTIONS.map((option) => (
                  <option key={option} style={darkOptionStyle} value={option}>
                    {option} columnas
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-300">Columnas mobile</span>
              <select
                className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none"
                style={{ colorScheme: "dark" }}
                {...register("mobileColumns", {
                  valueAsNumber: true,
                })}
              >
                {MOBILE_COLUMN_OPTIONS.map((option) => (
                  <option key={option} style={darkOptionStyle} value={option}>
                    {option} columnas
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[26px] border border-white/8 bg-slate-950/45 p-5">
        <div className="flex items-center gap-3">
          <MonitorSmartphone className="h-4 w-4 text-cyan-300" />
          <p className={sectionTitleClass}>Placement</p>
        </div>

        <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Widget maestro</p>
              <p className="mt-1 text-xs text-slate-400">
                Desactiva toda la inyeccion sin desinstalar la app.
              </p>
            </div>
            <input className="h-5 w-5 accent-cyan-300" type="checkbox" {...register("widgetEnabled")} />
          </div>
        </label>

        <label>
          <input className="sr-only" type="checkbox" {...register("productPageEnabled")} />
          <PlacementToggle
            description="Renderiza el widget debajo del contexto de compra principal."
            isActive={liveConfig.productPageEnabled}
            label="Pagina de producto"
          />
        </label>

        <label>
          <input className="sr-only" type="checkbox" {...register("cartPageEnabled")} />
          <PlacementToggle
            description="Muestra recomendaciones dentro del carrito cuando hay items."
            isActive={liveConfig.cartPageEnabled}
            label="Carrito"
          />
        </label>
      </section>

      <section className="grid gap-4 rounded-[26px] border border-white/8 bg-slate-950/45 p-5">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-4 w-4 text-cyan-300" />
          <p className={sectionTitleClass}>Reglas de inventario</p>
        </div>

        <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">{REGLAS_DE_INVENTARIO.ocultarSinStock}</p>
            </div>
            <input className="h-5 w-5 accent-cyan-300" type="checkbox" {...register("hideOutOfStock")} />
          </div>
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">{REGLAS_DE_INVENTARIO.exigirImagen}</p>
            </div>
            <input className="h-5 w-5 accent-cyan-300" type="checkbox" {...register("requireImage")} />
          </div>
        </label>
      </section>

      <div className="grid gap-3 rounded-[22px] border border-white/8 bg-slate-950/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p
              className={cn(
                "text-sm",
                saveStatus?.kind === "success"
                  ? "text-emerald-200"
                  : saveStatus?.kind === "error"
                    ? "text-rose-200"
                    : "text-slate-400",
              )}
            >
              {saveStatus?.message ?? "Los cambios se reflejan en la vista previa en tiempo real."}
            </p>
            {errors.backgroundColor || errors.accentColor ? (
              <p className="text-xs text-rose-300">
                Usa colores hex validos, por ejemplo `#0A0F1A` o `#58E2F3`.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={discardChanges} type="button" variant="ghost">
              <RotateCcw className="mr-2 h-4 w-4" />
              Descartar
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Guardar y publicar
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
          <ShoppingCart className="h-3.5 w-3.5" />
          Store #{storeId}
        </div>
      </div>
    </form>
  );
};
