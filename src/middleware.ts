import { isProtectedPath } from "@/resources/protectedRoutes";
import { AUTH_COOKIE, verifyAuthToken } from "@/utils/auth";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Server-side enforcement for password-protected routes.
 *
 * The client-side RouteGuard only decides what to *render*; without this
 * middleware the page would still be server-rendered and shipped in the RSC
 * payload, readable with JavaScript disabled. Blocking here means protected
 * content never leaves the server unauthenticated.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (await verifyAuthToken(token)) {
    const response = NextResponse.next();
    // Authenticated responses must not be stored by shared caches or the CDN.
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  // Rewrite (not redirect) so the URL is preserved and RouteGuard can show the
  // password prompt, while the protected page itself is never rendered.
  const url = request.nextUrl.clone();
  url.pathname = "/unauthorized";

  const response = NextResponse.rewrite(url);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Run on every page request. Only Next internals, API routes (which do their
  // own checks) and files with a known static-asset extension are skipped.
  // The extension list is an allowlist on purpose: excluding "anything with a
  // dot" would also skip `/work.rsc`-style payload URLs.
  matcher: [
    "/((?!_next/static|_next/image|api/|images/|.*\\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|pdf|woff2?)$).*)",
  ],
};
