"use client";

import { RouteGuard } from "@/components/RouteGuard";
import scope from "@/components/workbench/scope.module.scss";
import { Flex } from "@once-ui-system/core";
import { usePathname } from "next/navigation";

// Transitional, for the 2026 redesign. Pages rebuilt in Workbench draw
// full-bleed bands and set their own gutters, so they get a bare <main> with
// Workbench's type and link rules. Pages not rebuilt yet keep the padded,
// centred Once UI wrapper exactly as before, so their spacing does not change.
// Each page leaves LEGACY_ROUTES as it is redesigned; when the list is empty,
// the legacy branch (and this switch) goes away. Unknown paths (the 404) are
// Workbench. The decision is a pure function of the pathname, so the server
// HTML and the hydrated markup match.

/** Routes not redesigned yet. An entry ending in "/" matches every page below it. */
const LEGACY_ROUTES = ["/work", "/work/", "/blog", "/blog/"];

function isLegacy(pathname: string) {
  return LEGACY_ROUTES.some((route) =>
    route.endsWith("/") ? pathname.startsWith(route) : pathname === route,
  );
}

export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!pathname || !isLegacy(pathname)) {
    return (
      <main id="main" className={`${scope.scope} ${scope.main}`}>
        <RouteGuard>{children}</RouteGuard>
      </main>
    );
  }

  return (
    <Flex
      zIndex={0}
      fillWidth
      padding="l"
      horizontal="center"
      flex={1}
      className="main-content-wrapper"
    >
      <Flex horizontal="center" fillWidth minHeight="0">
        <RouteGuard>{children}</RouteGuard>
      </Flex>
    </Flex>
  );
}
