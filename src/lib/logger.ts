type LogLevel = "info" | "warn" | "error";

const normalizeMeta = (meta?: Record<string, unknown>): Record<string, unknown> => {
  if (!meta) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => {
      if (value instanceof Error) {
        return [
          key,
          {
            message: value.message,
            name: value.name,
            stack: value.stack,
          },
        ];
      }

      return [key, value];
    }),
  );
};

const writeLog = (level: LogLevel, message: string, meta?: Record<string, unknown>): void => {
  const payload = JSON.stringify({
    level,
    message,
    meta: normalizeMeta(meta),
    service: "vortex-engine",
    timestamp: new Date().toISOString(),
  });

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
};

export const logger = {
  error: (message: string, meta?: Record<string, unknown>): void =>
    writeLog("error", message, meta),
  info: (message: string, meta?: Record<string, unknown>): void =>
    writeLog("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void =>
    writeLog("warn", message, meta),
};
