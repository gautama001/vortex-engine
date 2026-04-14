import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { OAUTH_STATE_COOKIE } from "@/lib/security";
import { buildInstallUrl } from "@/lib/tiendanube/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const storeDomain = request.nextUrl.searchParams.get("store_domain");
  const state = crypto.randomUUID();

  try {
    const redirectUrl = buildInstallUrl(storeDomain, state);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 10,
      name: OAUTH_STATE_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: state,
    });

    logger.info("Starting TiendaNube OAuth installation flow", {
      hasStoreDomain: Boolean(storeDomain),
      storeDomain,
    });

    return response;
  } catch (error) {
    logger.warn("Invalid install request", {
      error,
      storeDomain,
    });

    return NextResponse.json(
      {
        error: "invalid_install_request",
        message: "El dominio de TiendaNube no es valido.",
      },
      { status: 400 },
    );
  }
}
