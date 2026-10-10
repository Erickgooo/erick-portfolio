// Loads every measured route in real browsers and fails on any Content Security
// Policy violation or console error. Each route is loaded, scrolled to the bottom
// (scroll-driven motion, lazy media) and then left through a header link, so the
// View Transition path runs under the policy too.
//
// Usage: node scripts/quality/csp-check.mjs [baseURL]   (default http://localhost:3100)
// Needs `npm run build && npm run start -- -p 3100` first when run locally.
//
// WebKit only runs against https: on plain-http localhost it upgrades every
// subresource (upgrade-insecure-requests) and nothing loads — see tests/e2e/fixtures.ts.
import { chromium, devices, firefox, webkit } from "@playwright/test";

const BASE = (process.argv[2] ?? process.env.CSP_BASE_URL ?? "http://localhost:3100").replace(
  /\/$/,
  "",
);
const BYPASS = process.env.LH_BYPASS;
const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(BASE);
const ANALYTICS_SCRIPT = "/_vercel/insights/script.js";
const ROUTES = ["/", "/about", "/work", "/blog/my-workspace", "/gallery"];
const TARGETS = [
  { name: "chromium", type: chromium, device: devices["Desktop Chrome"] },
  { name: "mobile-chromium", type: chromium, device: devices["Pixel 7"] },
  { name: "firefox", type: firefox, device: devices["Desktop Firefox"] },
  ...(BASE.startsWith("https:")
    ? [{ name: "webkit", type: webkit, device: devices["Desktop Safari"] }]
    : []),
];

const findings = [];
const stats = [];

for (const target of TARGETS) {
  const browser = await target.type.launch();
  for (const route of ROUTES) {
    const context = await browser.newContext({
      ...target.device,
      extraHTTPHeaders: BYPASS
        ? { "x-vercel-protection-bypass": BYPASS, "x-vercel-set-bypass-cookie": "true" }
        : undefined,
    });
    const page = await context.newPage();
    const where = () => `${target.name} ${route}`;
    let transitions = 0;

    await page.exposeFunction("__cspViolation", (v) =>
      findings.push({ where: where(), kind: "csp", ...v }),
    );
    await page.exposeFunction("__vtStarted", () => {
      transitions += 1;
    });
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => {
        window.__cspViolation({
          directive: e.effectiveDirective,
          blocked: e.blockedURI,
          source: `${e.sourceFile ?? ""}:${e.lineNumber ?? ""}`,
          sample: e.sample,
        });
      });
      const start = document.startViewTransition;
      if (start) {
        document.startViewTransition = function (...args) {
          window.__vtStarted();
          return start.apply(this, args);
        };
      }
    });
    page.on("console", (msg) => {
      // Outside Vercel the @vercel/analytics script 404s; same allow-list as smoke.spec.ts.
      const analytics = `${msg.location().url} ${msg.text()}`.includes(ANALYTICS_SCRIPT);
      if (msg.type() === "error" && !(IS_LOCAL && analytics)) {
        findings.push({ where: where(), kind: "console", text: msg.text().slice(0, 300) });
      }
    });
    page.on("pageerror", (err) => {
      findings.push({ where: where(), kind: "pageerror", text: String(err).slice(0, 300) });
    });

    const response = await page.goto(BASE + route, { waitUntil: "load" });
    const csp = response?.headers()["content-security-policy"] ?? "";
    const boot = await page.evaluate(() => ({
      fx: document.documentElement.dataset.fx ?? null,
    }));

    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Leave through the header so the View Transition listener runs.
    const next = route === "/about" ? "/work" : "/about";
    const burger = page.getByRole("button", { name: "Open menu" });
    if (await burger.isVisible()) await burger.click();
    const link = page.locator(`header a[href="${next}"]:visible`).first();
    let navigated = false;
    if (await link.count()) {
      await link.click();
      await page.waitForURL(`**${next}`, { timeout: 15000 }).catch(() => {});
      navigated = new URL(page.url()).pathname === next;
      await page.waitForTimeout(1200);
    }
    stats.push({
      where: where(),
      status: response?.status(),
      csp: csp ? "present" : "MISSING",
      fx: boot.fx,
      navigated,
      transitions,
    });
    await context.close();
  }
  await browser.close();
}

console.table(stats);
if (findings.length) {
  console.log(JSON.stringify(findings, null, 2));
  console.error(`csp-check: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log(`csp-check OK: 0 CSP violations, 0 console errors (${stats.length} page loads)`);
