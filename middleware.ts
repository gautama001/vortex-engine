import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  buildSignedSessionValue,
  isRecentTimestamp,
  verifySignedSessionValue,
  verifySortedQueryHmac,
} from "@/lib/security";

export const config = {
  matcher: ["/app/:path*"],
};

const cookieSameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

const applyPrivateNoStoreHeaders = (response: NextResponse): NextResponse => {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Vary", "Cookie");

  return response;
};

const buildRootRedirect = (request: NextRequest, error: string): NextResponse => {
  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("error", error);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(ADMIN_SESSION_COOKIE);

  return applyPrivateNoStoreHeaders(response);
};

const buildCleanAppUrl = (request: NextRequest): URL => {
  const cleanUrl = request.nextUrl.clone();

  cleanUrl.searchParams.delete("hmac");
  cleanUrl.searchParams.delete("timestamp");
  cleanUrl.searchParams.delete("store_id");
  cleanUrl.searchParams.delete("user_id");

  return cleanUrl;
};

export async function middleware(request: NextRequest) {
  try {
    const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;

    if (!clientSecret) {
      return applyPrivateNoStoreHeaders(NextResponse.next());
    }

    const url = request.nextUrl;
    const hmac = url.searchParams.get("hmac");
    const requestedStoreId = url.searchParams.get("store_id") || url.searchParams.get("user_id");
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = sessionCookie
      ? await verifySignedSessionValue(sessionCookie, clientSecret)
      : null;

    if (hmac) {
      const timestamp = url.searchParams.get("timestamp");

      if (timestamp && !isRecentTimestamp(timestamp)) {
        return buildRootRedirect(request, "stale_admin_request");
      }

      const isValidHmac = await verifySortedQueryHmac(url.searchParams, clientSecret);

      if (!isValidHmac) {
        return buildRootRedirect(request, "invalid_admin_hmac");
      }

      if (!requestedStoreId) {
        return buildRootRedirect(request, "missing_admin_store");
      }

      const cleanUrl = buildCleanAppUrl(request);

      if (session?.storeId !== requestedStoreId) {
        const signedSession = await buildSignedSessionValue(requestedStoreId, clientSecret);
        const response = NextResponse.redirect(cleanUrl);

        response.cookies.set(ADMIN_SESSION_COOKIE, signedSession, {
          httpOnly: true,
          maxAge: 60 * 60 * 12,
          path: "/",
          sameSite: cookieSameSite,
          secure: process.env.NODE_ENV === "production",
        });

        return applyPrivateNoStoreHeaders(response);
      }

      if (cleanUrl.toString() !== request.nextUrl.toString()) {
        return applyPrivateNoStoreHeaders(NextResponse.redirect(cleanUrl));
      }

      return applyPrivateNoStoreHeaders(NextResponse.next());
    }

    if (session?.storeId) {
      return applyPrivateNoStoreHeaders(NextResponse.next());
    }

    const response = applyPrivateNoStoreHeaders(NextResponse.next());

    if (sessionCookie) {
      response.cookies.delete(ADMIN_SESSION_COOKIE);
    }

    return response;
  } catch {
    return buildRootRedirect(request, "admin_runtime_error");
  }
}
