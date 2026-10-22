import { NotFound as WorkbenchNotFound } from "@/components/workbench/system/NotFound";

// The 404, in Workbench. RouteGuard also renders this for disabled routes.
export default function NotFound() {
  return <WorkbenchNotFound />;
}
