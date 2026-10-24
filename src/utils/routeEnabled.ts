import type { PagePath } from "@/resources/site";

type Routes = Record<PagePath, boolean>;

/** Routes whose children (/work/[slug], /blog/[slug]) inherit the parent's flag. */
const DYNAMIC_PARENTS = ["/blog", "/work"] as const;

/**
 * Whether `pathname` should render, given which routes are on. Pure, so it can
 * run during render on the server and the client alike (no effect, no flash).
 * Password protection is NOT decided here — middleware.ts enforces it.
 */
export function isRouteEnabled(pathname: string | null, routes: Routes): boolean {
  if (!pathname) return false;

  // Rendered by the middleware rewrite for protected routes; never in `routes`.
  if (pathname === "/unauthorized") return true;

  if (pathname in routes) {
    return routes[pathname as keyof Routes];
  }

  for (const parent of DYNAMIC_PARENTS) {
    if (pathname.startsWith(`${parent}/`) && routes[parent]) {
      return true;
    }
  }

  return false;
}
