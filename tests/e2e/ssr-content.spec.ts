import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { headerLink } from "./helpers";

// With JavaScript disabled the page shows exactly the server HTML. Before the
// fix RouteGuard rendered a spinner on the server, so no heading existed.
test.describe("server-rendered content", () => {
  test.use({ javaScriptEnabled: false });

  const cases = [
    { path: "/", text: /The marketing department is one person\./ },
    { path: "/about", text: /Erick Mahecha/ },
    // The nav's own label, not the browser title ("Projects – Erick Mahecha").
    { path: "/work", text: /^Projects$/ },
    { path: "/blog/my-workspace", text: /My Workspace/ },
    // The nav's label again, not the browser title ("Visual Work – Erick Mahecha").
    { path: "/gallery", text: /^Visual Work$/ },
  ];

  for (const c of cases) {
    test(`${c.path} has its h1 in the server HTML`, async ({ page }) => {
      await page.goto(c.path);
      await expect(page.locator("h1").first()).toHaveText(c.text);
    });
  }
});

test.describe("the project list without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  // The first picture is the largest thing on /work: it has to be in the server
  // HTML and painted, not waiting for a script to reveal it.
  test("the first project's picture is painted", async ({ page }) => {
    await page.goto("/work");
    const picture = page.locator("[data-project-media] img").first();
    await expect(picture).toBeVisible();
    const state = await picture.evaluate((img: HTMLImageElement) => {
      let opacity = 1;
      for (let node: Element | null = img; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      return { opacity, loading: img.loading, width: img.getBoundingClientRect().width };
    });
    expect(state.opacity).toBe(1);
    // Fetched with the page, not when it scrolls into view.
    expect(state.loading).not.toBe("lazy");
    expect(state.width).toBeGreaterThan(200);
    await expect
      .poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  });
});

test.describe("a case study without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  // The figures are the ones the project wrote, there from the server: nothing
  // counts up to them, and nothing is left at zero when no script runs.
  test("the results show the figures as written", async ({ page }) => {
    const source = readFileSync("src/app/work/projects/quick-metal-shop-viral-videos.mdx", "utf8");
    const written = [...source.matchAll(/<ResultsStats data="([^"]+)"/g)].flatMap((match) =>
      match[1]
        .split("|")
        .filter((_, index) => index % 2 === 0)
        .map((value) => value.trim()),
    );
    expect(written.length).toBeGreaterThan(10);
    await page.goto("/work/quick-metal-shop-viral-videos");
    const shown = await page.locator('[class*="ResultsStats_value"]').allTextContents();
    expect(shown.map((value) => value.trim())).toEqual(written);
  });
});

test.describe("a missing page without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("says so, and links to the homepage", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.locator("h1").first()).toHaveText("Page not found");
    await expect(
      page.getByText("The address may be mistyped, or the page may have moved."),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to the homepage" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

test("home server HTML preloads a next/font woff2 file", async ({ request }) => {
  // Task 11b: next/font emits <link rel="preload" as="font" ...> for the
  // fonts it detects are used on the page. Guards against the Home route
  // regressing to zero preloads (the root-cause bug this task fixed).
  test.skip(
    process.platform === "win32",
    "Next.js #57008: font manifest path bug on Windows; preload verified on the Linux Vercel Preview",
  );
  const response = await request.get("/");
  const body = await response.text();
  expect(body).toMatch(/<link[^>]*rel="preload"[^>]*as="font"[^>]*type="font\/woff2"[^>]*>/);
});

test("csp is intact outside webkit-localhost", async ({ page, browserName }) => {
  // Proves the fixtures.ts auto fixture is scoped correctly: on every browser
  // other than WebKit (which strips CSP/HSTS against localhost — see
  // tests/e2e/fixtures.ts), the real production CSP header from
  // next.config.mjs must still reach the page untouched.
  test.skip(browserName === "webkit", "webkit-localhost intentionally strips CSP; see fixtures.ts");
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain("upgrade-insecure-requests");
});

test("client navigation never flashes NotFound", async ({ page }) => {
  // WebKit + local production CSP: see tests/e2e/fixtures.ts for why the
  // `stripCspOnWebkitLocalhost` auto fixture strips CSP/HSTS on WebKit
  // against localhost. Without it, a cascade of failed CSS loads (every
  // subresource upgraded to https and failing to connect) left an unrelated
  // `next/image fill` element (e.g. a project's team avatar) without a
  // positioned containing block, stretching it across the whole document and
  // intercepting the click meant for the header link underneath it —
  // confirmed via getComputedStyle/requestfailed logging during the
  // investigation (see task-3-report.md, Fix round 1). This was never a real
  // click-target bug, just a test-environment artifact of testing a
  // production CSP over plain HTTP.

  await page.goto("/about");
  const seen: string[] = [];
  await page.exposeFunction("__record", (t: string) => seen.push(t));
  await page.evaluate(() => {
    new MutationObserver(() => {
      if (document.body.innerText.includes("Page not found")) {
        (window as unknown as { __record: (t: string) => void }).__record("404");
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
  await headerLink(page, "Projects").click();
  await page.waitForURL("**/work");
  await headerLink(page, "About").click();
  await page.waitForURL((url) => url.pathname === "/about");
  expect(seen).toEqual([]);
});

async function copyH1(page: Page) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return "";
    const range = document.createRange();
    range.selectNodeContents(h1);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    return sel?.toString().replace(/\s+/g, " ").trim() ?? "";
  });
}

test("/about: h1 keeps its exact accessible name", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Erick Mahecha");
});

test("/about: copying the h1 yields the text once", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "selection API assertion is Chromium-only");
  await page.goto("/about");
  expect(await copyH1(page)).toBe("Erick Mahecha");
});
