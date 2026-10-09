import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { headerLink } from "./helpers";

async function duplicateVtNames(page: Page) {
  return page.evaluate(() => {
    const names = [...document.querySelectorAll("*")]
      .map((el) => getComputedStyle(el).viewTransitionName)
      .filter((n) => n && n !== "none");
    return names.filter((n, i) => names.indexOf(n) !== i);
  });
}

const workLink = (page: Page) => headerLink(page, "Projects");

test("internal navigation runs a view transition and lands on the page", async ({
  page,
  browserName,
}) => {
  test.skip(browserName === "firefox", "same-document VT support varies in Firefox");
  await page.goto("/about");
  await page.evaluate(() => {
    const w = window as unknown as { __vt: number };
    w.__vt = 0;
    const orig = document.startViewTransition?.bind(document);
    if (!orig) return;
    document.startViewTransition = ((cb: () => Promise<void>) => {
      w.__vt++;
      return orig(cb);
    }) as typeof document.startViewTransition;
  });
  await (await workLink(page)).click();
  await page.waitForURL("**/work");
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(1);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("vt-active")))
    .toBe(false);
});

test("slow navigation skips the transition and still navigates", async ({ page, browserName }) => {
  test.skip(browserName === "firefox", "same-document VT support varies in Firefox");
  await page.goto("/about");
  await page.route(/\/work(\?|$)/, async (route) => {
    await new Promise((r) => setTimeout(r, 900));
    await route.continue();
  });
  await (await workLink(page)).click();
  await page.waitForURL("**/work", { timeout: 10_000 });
  await expect(page.locator("h1").first()).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("vt-active")))
    .toBe(false);
});

test("a double click on a slow route leaves no transition hanging", async ({
  page,
  browserName,
}) => {
  test.skip(browserName === "firefox", "same-document VT support varies in Firefox");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Vercel Analytics' script only exists on Vercel; locally it 404s.
  page.on("console", (m) => {
    const text = m.text();
    if (m.type() !== "error" || /_vercel\/insights|Failed to load resource/.test(text)) return;
    errors.push(text);
  });
  // Installed before goto so the prefetch is slow too and both clicks race.
  await page.route(/\/work(\?|$)/, async (route) => {
    await new Promise((r) => setTimeout(r, 900));
    await route.continue();
  });
  await page.goto("/about");
  await page.evaluate(() => {
    const w = window as unknown as { __settled: boolean[] };
    w.__settled = [];
    const orig = document.startViewTransition?.bind(document);
    if (!orig) return;
    document.startViewTransition = ((cb: () => Promise<void>) => {
      const t = orig(cb);
      const i = w.__settled.push(false) - 1;
      const settle = () => {
        w.__settled[i] = true;
      };
      t.updateCallbackDone.then(settle, settle);
      return t;
    }) as typeof document.startViewTransition;
  });
  await (await workLink(page)).dblclick();
  await page.waitForURL("**/work", { timeout: 10_000 });
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __settled: boolean[] }).__settled), {
      timeout: 2000,
    })
    .not.toContain(false);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("vt-active")))
    .toBe(false);
  expect(errors).toEqual([]);
});

test("back navigation restores scroll without leftover transition names", async ({ page }) => {
  await page.goto("/about");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(300);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 1200));
  await (await workLink(page)).click();
  await page.waitForURL("**/work");
  await page.goBack();
  await page.waitForURL("**/about");
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 3000 })
    .toBeGreaterThan(1000);
  expect(await duplicateVtNames(page)).toEqual([]);
  const inline = await page.$$eval("[style*='view-transition-name']", (els) =>
    els
      .map((e) => (e as HTMLElement).style.viewTransitionName)
      .filter((n) => n && n !== "site-header"),
  );
  expect(inline).toEqual([]);
});

test("modified clicks are not intercepted", async ({ page, context }) => {
  await page.goto("/blog/my-workspace");
  const popupPromise = context.waitForEvent("page", { timeout: 5000 }).catch(() => null);
  await (await workLink(page)).click({ modifiers: ["ControlOrMeta"] });
  const popup = await popupPromise;
  if (popup) await popup.close();
  expect(new URL(page.url()).pathname).toBe("/blog/my-workspace");
});

test("no page ever has duplicate view-transition names", async ({ page }) => {
  for (const p of ["/", "/about", "/work", "/work/leadbot-ai", "/blog/my-workspace", "/gallery"]) {
    await page.goto(p);
    expect(await duplicateVtNames(page), p).toEqual([]);
  }
});
