const runtimeState = globalThis as typeof globalThis & {
  __vortexRuntimeState?: {
    bootedAt: string;
    instanceId: string;
  };
};

const createInstanceId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const RUNTIME_STATE =
  runtimeState.__vortexRuntimeState ??
  (() => {
    const nextRuntimeState = {
      bootedAt: new Date().toISOString(),
      instanceId: createInstanceId(),
    };

    runtimeState.__vortexRuntimeState = nextRuntimeState;

    return nextRuntimeState;
  })();
