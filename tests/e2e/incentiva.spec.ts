import { expect, test } from "./fixtures";

// The Incentiva Group role (2026-11-02, docs/design/rediseno-2026/incentiva-encargo.md):
// the seven case studies and the index load, each one's scene starts and
// moves (the medal's with the scroll), with reduced motion every scene stands
// still on its last step, and the index lists every project with one of the
// four statuses.

const PAGES: { path: string; figures: string[]; scrub?: boolean }[] = [
  { path: "/work/scope-multi-client-platform", figures: ["11 days"] },
  { path: "/work/scope-ios-launch", figures: ["13"] },
  { path: "/work/chatflow-whatsapp-ai-platform", figures: ["3,177"] },
  { path: "/work/directv-click-to-whatsapp", figures: [] },
  { path: "/work/ai-cv-screening", figures: [] },
  { path: "/work/incentiva-launch-campaign", figures: [] },
  { path: "/work/incentiva-website-brand", figures: [], scrub: true },
  { path: "/work/incentiva-group", figures: ["13,000+"] },
];

for (const { path, figures, scrub } of PAGES) {
  test(`${path} loads and its scene starts and moves`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    const scene = page.locator("main [data-scene]").first();
    await expect(scene).toHaveAttribute("aria-hidden", "true");
    const counts = await page
      .locator("main [data-scene] [data-count]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-count")));
    expect(counts).toEqual(figures);

    if (scrub) {
      // Halfway through the scene's part of the text, the medal is apart.
      await scene.evaluate((el) => {
        const desk = window.matchMedia("(min-width: 1024px)").matches;
        const anchor = desk ? (el.closest("section") ?? el) : el;
        const box = anchor.getBoundingClientRect();
        const y0 = window.scrollY + box.top - window.innerHeight * 0.85;
        window.scrollTo(0, y0 + (box.height + window.innerHeight * 0.4) * 0.5);
      });
      await expect(scene).toHaveAttribute("data-started", "", { timeout: 10_000 });
      await expect
        .poll(async () => Number(await scene.getAttribute("data-step")), { timeout: 10_000 })
        .toBeGreaterThan(0);
      // Back above it, it reassembles (the step goes back down).
      const at = Number(await scene.getAttribute("data-step"));
      await scene.evaluate((el) => {
        const desk = window.matchMedia("(min-width: 1024px)").matches;
        const anchor = desk ? (el.closest("section") ?? el) : el;
        const box = anchor.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + box.top - window.innerHeight * 0.8);
      });
      await expect
        .poll(async () => Number(await scene.getAttribute("data-step")), { timeout: 10_000 })
        .toBeLessThan(at);
      return;
    }

    await scene.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(scene).toHaveAttribute("data-started", "", { timeout: 10_000 });
    await expect
      .poll(async () => Number(await scene.getAttribute("data-step")), { timeout: 10_000 })
      .toBeGreaterThan(0);
  });

  test(`${path} with reduced motion: the scene stands still on its last step`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    const scene = page.locator("main [data-scene]").first();
    await scene.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(scene).toHaveAttribute("data-started", "");
    const last = (await scene.getAttribute("data-steps"))?.split(",").length ?? 1;
    await expect(scene).toHaveAttribute("data-step", String(last - 1));
    await page.waitForTimeout(1200);
    await expect(scene).toHaveAttribute("data-step", String(last - 1));
    const moving = await scene.evaluate(
      (el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().activeDuration)
          .length,
    );
    expect(moving).toBe(0);
    for (const value of figures) {
      await expect(scene.locator(`[data-count="${value}"] [data-count-text]`)).toHaveText(value);
    }
  });
}

test("the index lists every project of the role, with one of the four statuses", async ({
  page,
}) => {
  await page.goto("/work/incentiva-group");
  const cards = page.locator("main article");
  await expect(cards).toHaveCount(32);
  const statuses = await cards.evaluateAll((els) =>
    els.map((el) => el.querySelector("p")?.textContent?.trim() ?? ""),
  );
  const allowed = ["In production", "Delivered to client", "Internal", "Proposal / pitch"];
  for (const s of statuses) expect(allowed).toContain(s);
  // The projects that are part of a case link to it; the seven cases are listed above.
  await expect(page.locator("main article a[href^='/work/']")).toHaveCount(11);
  await expect(page.getByRole("heading", { name: "Seven case studies" })).toBeVisible();
  const text = (await page.locator("main").textContent()) ?? "";
  for (const banned of ["Mars", "Masterfoods", "Impulso", "incentiva-preview"]) {
    expect(text).not.toContain(banned);
  }
});

test("the sitemap lists the index and the seven cases", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const { path } of PAGES) expect(xml).toContain(path);
});
