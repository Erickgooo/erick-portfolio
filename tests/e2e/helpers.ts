import type { Page } from "@playwright/test";

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
