"use client";

import { RouteGuard } from "@/components/RouteGuard";
import scope from "@/components/workbench/scope.module.scss";
import { Flex } from "@once-ui-system/core";
import { usePathname } from "next/navigation";

// Transitional, for the 2026 redesign. Pages already rebuilt in Workbench draw
// full-bleed bands and set their own gutters, so they get a bare <main> with
// Workbench's type and link rules. Every other page keeps the padded, centred
// Once UI wrapper exactly as before, so its spacing does not change. Each page
// joins WORKBENCH_ROUTES as it is redesigned; when all have, the legacy branch
// (and this switch) goes away. The decision is a pure function of the pathname,
// so the server HTML and the hydrated markup match.

/** Routes already redesigned in Workbench, matched exactly. */
const WORKBENCH_ROUTES = new Set(["/"]);

export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname && WORKBENCH_ROUTES.has(pathname)) {
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
