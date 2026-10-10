import type { RoutesConfig } from "@/types";

/** Routes whose children (/work/[slug], /blog/[slug]) inherit the parent's flag. */
const DYNAMIC_PARENTS = ["/blog", "/work"] as const;

/**
 * Whether `pathname` should render, given the `routes` config. Pure, so it can
 * run during render on the server and the client alike (no effect, no flash).
 * Password protection is NOT decided here — middleware.ts enforces it.
 */
export function isRouteEnabled(pathname: string | null, routes: RoutesConfig): boolean {
  if (!pathname) return false;

  // Rendered by the middleware rewrite for protected routes; never in `routes`.
  if (pathname === "/unauthorized") return true;

  // THROWAWAY: the directions page on the lab branch.
  if (pathname === "/lab" || pathname.startsWith("/lab/")) return true;

  if (pathname in routes) {
    return routes[pathname as keyof RoutesConfig];
  }

  for (const parent of DYNAMIC_PARENTS) {
    if (pathname.startsWith(`${parent}/`) && routes[parent]) {
      return true;
    }
  }

  return false;
}
