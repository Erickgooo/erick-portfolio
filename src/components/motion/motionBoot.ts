/**
 * Runs inline in <head> before first paint (layout.tsx serialises it with
 * Function.prototype.toString), so it must stay self-contained: no imports,
 * no references to anything outside this function body.
 *
 * - data-fx: "lite" on data-saver, on a 2g/3g connection (where the browser
 *   reports one), <=2 GB RAM (only where the browser exposes
 *   deviceMemory — Safari doesn't, and absence is not treated as low) or <4 cores.
 */
export function motionBoot(): void {
  const root = document.documentElement;
  try {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
    };
    const saveData = Boolean(nav.connection?.saveData);
    const slowLink = /^(slow-2g|2g|3g)$/.test(nav.connection?.effectiveType ?? "");
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
    const fewCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4;
    root.setAttribute("data-fx", saveData || slowLink || lowMemory || fewCores ? "lite" : "full");
  } catch {
    root.setAttribute("data-fx", "full");
  }
}
