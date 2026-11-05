import { NotFound as WorkbenchNotFound } from "@/components/workbench/system/NotFound";
import { profile } from "@/resources";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Page not found · ${profile.name}`,
  robots: { index: false, follow: false },
};

// The 404, in Workbench. RouteGuard also renders this for disabled routes.
export default function NotFound() {
  return <WorkbenchNotFound />;
}
