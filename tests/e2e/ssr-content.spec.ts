import { expect, test } from "./fixtures";

// With JavaScript disabled the page shows exactly the server HTML. Before the
// fix RouteGuard rendered a spinner on the server, so no heading existed.
test.describe("server-rendered content", () => {
  test.use({ javaScriptEnabled: false });

  const cases = [
    { path: "/", text: /I Build Marketing Infrastructure/ },
    { path: "/about", text: /Erick Mahecha/ },
    { path: "/work", text: /Projects/ },
    { path: "/blog/my-workspace", text: /My Workspace/ },
    { path: "/gallery", text: /Visual Work/ },
  ];

  for (const c of cases) {
    test(`${c.path} has its h1 in the server HTML`, async ({ page }) => {
      await page.goto(c.path);
      await expect(page.locator("h1").first()).toHaveText(c.text);
    });
  }
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

  // Starts on /about, not /, so the Home-only IntroLoader overlay (which
  // covers the page and blocks pointer events for several seconds on first
  // load) never appears and can't interfere with the clicks below.
  await page.goto("/about");
  const seen: string[] = [];
  await page.exposeFunction("__record", (t: string) => seen.push(t));
  await page.evaluate(() => {
    new MutationObserver(() => {
      if (document.body.innerText.includes("This page hasn't been built yet")) {
        (window as unknown as { __record: (t: string) => void }).__record("404");
      }
    }).observe(document.body, { childList: true, subtree: true });
  });
  // Header renders a desktop (text-labelled) and a mobile (icon-only, with
  // an aria-label) ToggleButton for each route, both carrying the same
  // accessible name; only one is ever in the accessibility tree at a time
  // (the other is `display: none` at the current breakpoint), so scoping to
  // `header` and matching by accessible name still targets exactly one link
  // unambiguously, regardless of which variant CSS happens to show.
  const header = page.locator("header");
  await header.getByRole("link", { name: "Projects" }).click();
  await page.waitForURL("**/work");
  await header.getByRole("link", { name: "About" }).click();
  await page.waitForURL((url) => url.pathname === "/about");
  expect(seen).toEqual([]);
});
