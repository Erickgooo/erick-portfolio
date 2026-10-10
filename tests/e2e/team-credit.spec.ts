import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./fixtures";

const dir = "src/app/work/projects";
const withTeam = readdirSync(dir)
  .filter((f) => f.endsWith(".mdx"))
  .map((f) => ({ slug: f.replace(/\.mdx$/, ""), src: readFileSync(path.join(dir, f), "utf8") }))
  .map(({ slug, src }) => ({
    slug,
    names: [...src.matchAll(/^\s+- name: "([^"]+)"/gm)].map((m) => m[1]),
  }))
  .filter((p) => p.names.length > 0);

test("at least one project credits a team", () => {
  expect(withTeam.length).toBeGreaterThan(0);
});

for (const p of withTeam) {
  test(`team credit visible on /work/${p.slug}`, async ({ page }) => {
    await page.goto(`/work/${p.slug}`);
    for (const name of p.names) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
  });
}
