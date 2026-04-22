import { NextResponse } from "next/server";

import { hasCoreEnvironment } from "@/lib/env";
import { BUILD_COMMIT_SHA, BUILD_TIMESTAMP, RELEASE_MARKER } from "@/lib/release";
import { RUNTIME_STATE } from "@/lib/runtime-state";

export const runtime = "nodejs";

export async function GET() {
  const payload = {
    build: {
      builtAt: BUILD_TIMESTAMP,
      commitSha: BUILD_COMMIT_SHA,
      release: RELEASE_MARKER,
    },
    hasCoreEnvironment: hasCoreEnvironment(),
    ok: true,
    runtime: {
      bootedAt: RUNTIME_STATE.bootedAt,
      instanceId: RUNTIME_STATE.instanceId,
      kind: "nodejs",
      uptimeSeconds: Math.round(process.uptime()),
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(
    payload,
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Vortex-Build-Release": RELEASE_MARKER,
        "X-Vortex-Runtime-Booted-At": RUNTIME_STATE.bootedAt,
        "X-Vortex-Runtime-Instance": RUNTIME_STATE.instanceId,
      },
      status: 200,
    },
  );
}
