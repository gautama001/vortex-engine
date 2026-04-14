import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  isRecentTimestamp,
  verifySignedSessionValue,
  verifySortedQueryHmac,
} from "@/lib/security";

export const config = {
  matcher: ["/app/:path*"],
};

export async function middleware(request: NextRequest) {
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;

  if (!clientSecret) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionCookie) {
    const session = await verifySignedSessionValue(sessionCookie, clientSecret);

    if (session) {
      return NextResponse.next();
    }
  }

  const hmac = request.nextUrl.searchParams.get("hmac");

  if (hmac) {
    const timestamp = request.nextUrl.searchParams.get("timestamp");

    if (timestamp && !isRecentTimestamp(timestamp)) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("error", "stale_admin_request");
      return NextResponse.redirect(redirectUrl);
    }

    const isValidHmac = await verifySortedQueryHmac(request.nextUrl.searchParams, clientSecret);

    if (isValidHmac) {
      return NextResponse.next();
    }
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("error", hmac ? "invalid_admin_hmac" : "missing_admin_session");
  return NextResponse.redirect(redirectUrl);
}
