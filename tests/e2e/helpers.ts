import { type Locator, type Page, type Request, expect } from "@playwright/test";

export const ROUTES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "work", path: "/work" },
  { name: "blog", path: "/blog/my-workspace" },
  { name: "gallery", path: "/gallery" },
] as const;

/**
 * Sums layout-shift entries (excluding those caused by recent input) from page
 * load until `settleMs` after load, the way the CLS metric counts them.
 * Chromium only: layout-shift entries are not exposed by Firefox/WebKit.
 */
export async function measureCLS(page: Page, settleMs = 3500): Promise<number> {
  await page.waitForLoadState("load");
  return page.evaluate(
    (ms) =>
      new Promise<number>((resolve) => {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as {
            value: number;
            hadRecentInput: boolean;
          }[]) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(cls), ms);
      }),
    settleMs,
  );
}

/** A visible header link; on phones the links live in the menu, which is opened first. */
export async function headerLink(page: Page, name: string): Promise<Locator> {
  const burger = page.locator('header button[aria-controls="site-menu"]');
  if (await burger.isVisible()) {
    // A navigation closes the menu a tick after the URL changes; let that settle
    // first, or the link handed back would belong to a menu that is about to close.
    await expect(burger).toHaveAttribute("aria-expanded", "false");
    await burger.click();
  }
  return page.locator("header").getByRole("link", { name, exact: true });
}

/**
 * A stand-in for `waitForLoadState("networkidle")` that ignores `blob:` requests.
 * Chromium keeps a Blob-backed media resource open for as long as a video element
 * may read from it, so a page with the home film never reaches Playwright's own
 * idle state. Call before navigating; await the returned function afterwards.
 */
export function trackNetwork(page: Page) {
  const pending = new Set<Request>();
  let lastActivity = Date.now();
  const settle = (request: Request) => {
    pending.delete(request);
    lastActivity = Date.now();
  };
  page.on("request", (request) => {
    if (request.url().startsWith("blob:")) return;
    pending.add(request);
    lastActivity = Date.now();
  });
  page.on("requestfinished", settle);
  page.on("requestfailed", settle);
  // Requests cancelled by a navigation (e.g. link prefetches) report neither event.
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) pending.clear();
  });

  return async (quietMs = 500, timeout = 30_000) => {
    await page.waitForLoadState("load");
    const deadline = Date.now() + timeout;
    while (pending.size > 0 || Date.now() - lastActivity < quietMs) {
      if (Date.now() > deadline) {
        const urls = [...pending].map((request) => request.url()).join(", ");
        throw new Error(`network did not go idle within ${timeout} ms: ${urls}`);
      }
      await page.waitForTimeout(100);
    }
  };
}

/**
 * Resolves once the Home intro has handed off. Until then its overlay intercepts
 * the pointer and the body is scroll-locked, which also freezes scroll timelines.
 */
export async function introDone(page: Page) {
  await page.waitForFunction(
    () => !document.documentElement.classList.contains("intro-pending"),
    null,
    { timeout: 8000 },
  );
}
