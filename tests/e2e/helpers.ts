import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Locator, Page, Request } from "@playwright/test";
import matter from "gray-matter";
import { isProtectedPath } from "../../src/resources/protectedRoutes";

export const ROUTES = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "work", path: "/work" },
  { name: "blog", path: "/blog/my-workspace" },
  { name: "gallery", path: "/gallery" },
] as const;

export interface CaseStudy {
  slug: string;
  /** Its page: `/work/<slug>`. */
  path: string;
  title: string;
  publishedAt: string;
  /** "value|label", where the project reports a headline result. */
  metric: string;
}

/**
 * The case studies the site can show, read from where the site reads them: one
 * MDX file each under src/app/work/projects, dated in its frontmatter. One
 * behind the password would render the prompt, so it is left out. A test that
 * lists them here keeps up when a project is added, renamed or redated.
 */
export function caseStudies(): CaseStudy[] {
  const dir = path.join("src", "app", "work", "projects");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.slice(0, -".mdx".length);
      const { data } = matter(readFileSync(path.join(dir, file), "utf8"));
      return {
        slug,
        path: `/work/${slug}`,
        title: String(data.title ?? ""),
        publishedAt: String(data.publishedAt ?? ""),
        metric: String(data.metric ?? ""),
      };
    })
    .filter((study) => !isProtectedPath(study.path));
}

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

/** A header link by its accessible name. The bar shows every link at every width. */
export function headerLink(page: Page, name: string): Locator {
  return page.locator("header").getByRole("link", { name, exact: true });
}

/**
 * Every element in the Home's film that carries text, each with the background
 * of the `[data-opaque]` surface it sits on: null when it sits straight on the
 * footage. An opaque colour serialises as `rgb()`; anything translucent, or a
 * background that was never painted, reads `rgba()`.
 */
export function wordsOnFilm(page: Page) {
  return page.evaluate(() => {
    const words: { text: string; surface: string | null }[] = [];
    for (const el of Array.from(document.querySelectorAll("[data-film-root] *"))) {
      const text = Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
      if (!text) continue;
      const surface = el.closest("[data-opaque]");
      words.push({ text, surface: surface ? getComputedStyle(surface).backgroundColor : null });
    }
    return { body: getComputedStyle(document.body).backgroundColor, words };
  });
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
