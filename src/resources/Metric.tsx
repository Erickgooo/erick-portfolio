import type { ReactNode } from "react";

// Data Callout, Manual §4.3: exact figures are set in the mono family and the
// Cobalto accent so "the number" reads as a different register from "the
// narrative" around it. Lives in resources (like EMIcon) because the About
// content uses it.
export const Metric = ({ children }: { children: ReactNode }) => (
  <span className="metric">{children}</span>
);
