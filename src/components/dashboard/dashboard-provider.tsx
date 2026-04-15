"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type { WidgetConfig } from "@/components/dashboard/types";

type DashboardStateValue = {
  draftConfig: WidgetConfig;
  lastSavedAt: string | null;
  savedConfig: WidgetConfig;
  selectedProductId: number | null;
};

type DashboardActionsValue = {
  commitConfig: (config: WidgetConfig, updatedAt: string) => void;
  resetDraftConfig: () => void;
  selectProduct: (productId: number | null) => void;
  setDraftConfig: (config: WidgetConfig) => void;
};

const DashboardStateContext = createContext<DashboardStateValue | null>(null);
const DashboardActionsContext = createContext<DashboardActionsValue | null>(null);

type DashboardProviderProps = PropsWithChildren<{
  initialConfig: WidgetConfig;
  initialSelectedProductId: number | null;
}>;

export const DashboardProvider = ({
  children,
  initialConfig,
  initialSelectedProductId,
}: DashboardProviderProps) => {
  const [draftConfig, setDraftConfig] = useState(initialConfig);
  const [savedConfig, setSavedConfig] = useState(initialConfig);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialSelectedProductId,
  );

  const stateValue = useMemo<DashboardStateValue>(
    () => ({
      draftConfig,
      lastSavedAt,
      savedConfig,
      selectedProductId,
    }),
    [draftConfig, lastSavedAt, savedConfig, selectedProductId],
  );

  const actionsValue = useMemo<DashboardActionsValue>(
    () => ({
      commitConfig: (config, updatedAt) => {
        setDraftConfig(config);
        setSavedConfig(config);
        setLastSavedAt(updatedAt);
      },
      resetDraftConfig: () => {
        setDraftConfig(savedConfig);
      },
      selectProduct: (productId) => {
        setSelectedProductId(productId);
      },
      setDraftConfig,
    }),
    [savedConfig],
  );

  return (
    <DashboardStateContext.Provider value={stateValue}>
      <DashboardActionsContext.Provider value={actionsValue}>
        {children}
      </DashboardActionsContext.Provider>
    </DashboardStateContext.Provider>
  );
};

const useDashboardStateContext = () => {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error("useDashboardStateContext must be used within DashboardProvider");
  }

  return context;
};

const useDashboardActionsContext = () => {
  const context = useContext(DashboardActionsContext);

  if (!context) {
    throw new Error("useDashboardActionsContext must be used within DashboardProvider");
  }

  return context;
};

export const useDashboardState = () => useDashboardStateContext();
export const useDashboardActions = () => useDashboardActionsContext();
