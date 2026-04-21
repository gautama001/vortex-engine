import { NextResponse } from "next/server";

import { hasCoreEnvironment } from "@/lib/env";
import { RELEASE_MARKER } from "@/lib/release";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      release: RELEASE_MARKER,
      runtime: "nodejs",
      hasCoreEnvironment: hasCoreEnvironment(),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status: 200,
    },
  );
}
