"use client";

// Shows the 404 in place of a page that is switched off in enabledRoutes. It
// is decided during render (a pure function of the path), so the right page is
// already in the server HTML: no spinner, no swap after hydration.
// Password protection is not handled here: middleware.ts enforces it on the
// server before the page is rendered.
import NotFound from "@/app/not-found";
import { enabledRoutes } from "@/resources";
import { isRouteEnabled } from "@/utils/routeEnabled";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isRouteEnabled(pathname, enabledRoutes) ? children : <NotFound />;
}
