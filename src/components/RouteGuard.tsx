"use client";

import NotFound from "@/app/not-found";
import { enabledRoutes } from "@/resources";
import { isRouteEnabled } from "@/utils/routeEnabled";
import { usePathname } from "next/navigation";

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * Hides enabledRoutes disabled in the `enabledRoutes` config.
 *
 * Decided during render (pure function of the pathname), so the page is part
 * of the server HTML — the previous effect-based version rendered a spinner on
 * the server and only swapped the page in after hydration, which delayed LCP
 * and shifted the footer on every route.
 *
 * Password protection is NOT handled here — middleware.ts enforces it on the
 * server before the page is ever rendered.
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();

  if (!isRouteEnabled(pathname, enabledRoutes)) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export { RouteGuard };
