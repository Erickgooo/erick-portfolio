import type { ProtectedRoutesConfig } from "@/types/config.types";

/**
 * Routes that require the password set in PAGE_ACCESS_PASSWORD.
 *
 * Kept in its own module with no runtime dependencies so `middleware.ts` can
 * import it without pulling fonts, JSX or content into the Edge bundle.
 * Enforcement lives in the middleware — RouteGuard only renders the prompt.
 *
 * Example: { "/work": true }
 *
 * Scope: protection covers the page and its RSC payload, and removes the route
 * from the sitemap, RSS feed and robots.txt. Files under `public/` are served
 * as static assets and are NEVER protected — do not put confidential media
 * there. Listings on other pages (e.g. project cards on the home page) are not
 * hidden either.
 */
const protectedRoutes: ProtectedRoutesConfig = {};

/** Enabled protected paths, e.g. ["/work"]. */
function getProtectedPaths(config: ProtectedRoutesConfig = protectedRoutes): string[] {
  return Object.entries(config)
    .filter(([, enabled]) => enabled)
    .map(([path]) => path);
}

/**
 * Whether `pathname` falls under a protected route.
 *
 * Matches the route itself, anything below it, and suffixed variants of it
 * (`/work.rsc`, `/work.segments/…`), which is how prerendered RSC payloads are
 * addressed on some hosts. Percent-encoding is decoded first so `/%77ork`
 * cannot slip past a check for `/work`.
 */
function isProtectedPath(
  pathname: string,
  config: ProtectedRoutesConfig = protectedRoutes,
): boolean {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed escape sequence: fall back to the raw pathname.
  }

  return getProtectedPaths(config).some((path) =>
    [pathname, decoded].some((candidate) => {
      if (path === "/") return true;
      return (
        candidate === path || candidate.startsWith(`${path}/`) || candidate.startsWith(`${path}.`)
      );
    }),
  );
}

export { protectedRoutes, getProtectedPaths, isProtectedPath };
