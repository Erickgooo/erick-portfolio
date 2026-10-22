import { RouteGuard } from "@/components/RouteGuard";
import scope from "@/components/workbench/scope.module.scss";

// Every page draws its own full-bleed bands and gutters (Workbench, redesign
// 2026), so the site gets a bare <main> with Workbench's type and link rules.
export function SiteMain({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className={`${scope.scope} ${scope.main}`}>
      <RouteGuard>{children}</RouteGuard>
    </main>
  );
}
