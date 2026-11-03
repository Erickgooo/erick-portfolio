import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "./fixtures";

// Round 6 (ajustes-cv-marcas-encargo.md): axe in both themes on the pages it
// touched: the Home (hero, brand stage, tool wall), About (#experience), the
// projects and the Incentiva index (its brands and its three statuses). It
// uses the axe-core that Lighthouse already brings, so no new dependency.

test.use({ bypassCSP: true });
const axePath = createRequire(__filename).resolve("axe-core/axe.min.js");
const INTRO = '[class*="IntroLoader_overlay"]';

for (const theme of ["light", "dark"] as const) {
  for (const path of ["/", "/about", "/work", "/work/incentiva-group"]) {
    test(`${theme} theme: no serious or critical violations on ${path}`, async ({ page }) => {
      test.setTimeout(60_000);
      await page.addInitScript((t) => localStorage.setItem("data-theme", t), theme);
      await page.goto(path);
      await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 15_000 });
      await page.waitForLoadState("load");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.evaluate(readFileSync(axePath, "utf8"));
      const violations = await page.evaluate(async () => {
        // biome-ignore lint/suspicious/noExplicitAny: axe is injected at run time
        const axe = (window as any).axe;
        const result = await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        });
        return result.violations
          .filter((v: { impact: string }) => v.impact === "serious" || v.impact === "critical")
          .map(
            (v: { id: string; impact: string; nodes: { target: string[] }[] }) =>
              `${v.impact} ${v.id}: ${v.nodes
                .slice(0, 3)
                .map((n) => n.target.join(" "))
                .join(" | ")}`,
          );
      });
      expect(violations).toEqual([]);
    });
  }
}
