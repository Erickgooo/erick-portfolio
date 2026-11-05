import type { APIRequestContext, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Technical SEO, read the way a crawler first reads a page: the server HTML,
// without JavaScript. Walks the sitemap the running site publishes, so a page
// added later is covered without touching this file. Also runs against
// production: E2E_BASE_URL=https://www.erickmahecha.com ... --project=chromium

const ORIGIN = "https://www.erickmahecha.com";
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;
const PERSON_ID = `${ORIGIN}/#person`;

type Entry = { path: string; loc: string; lastmod: string };

async function readSitemap(request: APIRequestContext): Promise<Entry[]> {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const entries = [
    ...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g),
  ].map(([, loc, lastmod]) => ({ loc, lastmod, path: new URL(loc).pathname }));
  expect(entries.length).toBeGreaterThan(0);
  return entries;
}

const isArticle = (path: string) =>
  (/^\/work\/[^/]+$/.test(path) && path !== "/work/incentiva-group") ||
  /^\/blog\/[^/]+$/.test(path);

/** The schema.org nodes a page must describe, and no others. */
function expectedTypes(path: string): string[] {
  if (path === "/") return ["Person", "WebPage", "WebSite"];
  if (path === "/about") return ["BreadcrumbList", "Person", "ProfilePage"];
  if (["/work", "/blog", "/gallery", "/work/incentiva-group"].includes(path)) {
    return ["BreadcrumbList", "CollectionPage", "Person"];
  }
  if (path.startsWith("/work/")) return ["Article", "BreadcrumbList", "Person"];
  return ["BlogPosting", "BreadcrumbList", "Person"];
}

/** Every string in a JSON value. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const meta = (page: Page, attr: "name" | "property", key: string) =>
  page.locator(`meta[${attr}="${key}"]`);

const relOnSite = (url: string) => {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.search}`;
};

test.describe("every sitemap URL, in the server HTML", () => {
  test.use({ javaScriptEnabled: false });

  test("has its own canonical, title, description, share card and schema.org graph", async ({
    page,
    request,
  }) => {
    test.setTimeout(240_000);
    const entries = await readSitemap(request);
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();

    for (const { path, loc, lastmod } of entries) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect.soft(response?.status(), `${path}: status`).toBe(200);
      expect
        .soft(response?.headers()["x-robots-tag"] ?? "", `${path}: X-Robots-Tag`)
        .not.toContain("noindex");
      expect.soft(await page.locator("html").getAttribute("lang"), `${path}: lang`).toBe("en");

      // Canonical: itself, with www and without parameters.
      const self = path === "/" ? ORIGIN : `${ORIGIN}${path}`;
      expect.soft(loc, `${path}: sitemap loc`).toBe(self);
      const canonical = page.locator('link[rel="canonical"]');
      await expect.soft(canonical, `${path}: one canonical`).toHaveCount(1);
      expect.soft(await canonical.first().getAttribute("href"), `${path}: canonical`).toBe(self);

      // Title and description: within range, and nobody else's.
      const title = await page.title();
      expect.soft(title.length, `${path}: title "${title}"`).toBeGreaterThan(0);
      expect.soft(title.length, `${path}: title "${title}"`).toBeLessThanOrEqual(TITLE_MAX);
      expect.soft(titles.get(title), `${path}: title also on`).toBeUndefined();
      titles.set(title, path);

      const description = (await meta(page, "name", "description").getAttribute("content")) ?? "";
      expect
        .soft(description.length, `${path}: description "${description}"`)
        .toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect
        .soft(description.length, `${path}: description "${description}"`)
        .toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect.soft(descriptions.get(description), `${path}: description also on`).toBeUndefined();
      descriptions.set(description, path);

      await expect.soft(page.locator("h1"), `${path}: one h1`).toHaveCount(1);
      await expect.soft(meta(page, "name", "robots"), `${path}: robots meta`).toHaveCount(0);

      // The share card.
      expect
        .soft(await meta(page, "property", "og:url").getAttribute("content"), `${path}: og:url`)
        .toBe(self);
      expect
        .soft(await meta(page, "property", "og:image").getAttribute("content"), `${path}: og:image`)
        .toMatch(/^https:\/\/www\.erickmahecha\.com\//);
      expect
        .soft(await meta(page, "property", "og:site_name").getAttribute("content"), path)
        .toBe("Erick Mahecha");
      expect
        .soft(await meta(page, "property", "og:locale").getAttribute("content"), path)
        .toBe("en_US");
      expect
        .soft(await meta(page, "property", "og:type").getAttribute("content"), `${path}: og:type`)
        .toBe(isArticle(path) ? "article" : "website");
      if (isArticle(path)) {
        expect
          .soft(
            await meta(page, "property", "article:modified_time").getAttribute("content"),
            `${path}: article:modified_time`,
          )
          .toBe(lastmod);
        await expect.soft(meta(page, "property", "article:published_time"), path).toHaveCount(1);
      }

      // The feed, for readers that look for it from any page.
      expect
        .soft(
          await page
            .locator('link[rel="alternate"][type="application/rss+xml"]')
            .getAttribute("href"),
          `${path}: feed`,
        )
        .toBe(`${ORIGIN}/api/rss`);

      // The schema.org graph.
      const scripts = page.locator('script[type="application/ld+json"]');
      await expect.soft(scripts, `${path}: one JSON-LD script`).toHaveCount(1);
      const raw = (await scripts.first().textContent()) ?? "";
      const data = JSON.parse(raw) as { "@graph": Record<string, unknown>[] };
      const graph = data["@graph"];
      expect
        .soft(graph.map((node) => node["@type"] as string).sort(), `${path}: node types`)
        .toEqual(expectedTypes(path));

      const person = graph.find((node) => node["@type"] === "Person");
      expect.soft(person?.["@id"], `${path}: Person @id`).toBe(PERSON_ID);
      expect.soft(person?.name, `${path}: Person name`).toBe("Erick Mahecha");
      expect.soft(person?.jobTitle, `${path}: Person jobTitle`).toBe("Growth & AI Systems Lead");
      expect.soft(person?.url, `${path}: Person url`).toBe(ORIGIN);
      expect.soft(person?.image, `${path}: Person image`).toBe(`${ORIGIN}/images/avatar.jpg`);
      expect
        .soft((person?.sameAs as string[] | undefined)?.length, `${path}: Person sameAs`)
        .toBeGreaterThan(0);

      for (const text of strings(data)) {
        if (text.includes("erickmahecha.com")) {
          expect.soft(text.startsWith(ORIGIN), `${path}: own URL without www, ${text}`).toBe(true);
        }
      }

      const main = graph.find((node) =>
        ["WebPage", "ProfilePage", "CollectionPage", "Article", "BlogPosting"].includes(
          node["@type"] as string,
        ),
      );
      expect.soft(main?.url, `${path}: main node url`).toBe(self);
      expect.soft(main?.dateModified, `${path}: dateModified`).toBe(lastmod);
      if (isArticle(path)) {
        expect.soft(main?.author, `${path}: author by @id`).toEqual({ "@id": PERSON_ID });
        expect
          .soft(
            String(main?.datePublished) <= String(main?.dateModified),
            `${path}: published ${main?.datePublished} after modified ${main?.dateModified}`,
          )
          .toBe(true);
      }
      if (path === "/about") {
        expect.soft(main?.mainEntity, "/about: mainEntity").toEqual({ "@id": PERSON_ID });
      }
      if (path !== "/") {
        const crumbs = graph.find((node) => node["@type"] === "BreadcrumbList")?.itemListElement as
          | { position: number; item: string }[]
          | undefined;
        expect.soft(crumbs?.[0]?.item, `${path}: breadcrumb starts at the home`).toBe(ORIGIN);
        expect.soft(crumbs?.at(-1)?.item, `${path}: breadcrumb ends on the page`).toBe(self);
      }
    }
  });
});

test("the sitemap and robots.txt speak of www, with real dates", async ({ request }) => {
  const entries = await readSitemap(request);
  for (const { loc, lastmod } of entries) {
    expect.soft(loc.startsWith(ORIGIN), loc).toBe(true);
    expect.soft(lastmod, loc).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  }
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  expect(robots).toContain("Disallow: /unauthorized");
});

test("the feed answers with www links", async ({ request }) => {
  const response = await request.get("/api/rss");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const xml = await response.text();
  expect(xml).toContain(`<link>${ORIGIN}/blog</link>`);
  expect(xml).not.toMatch(/https?:\/\/erickmahecha\.com/);
});

test.describe("what must stay out of the index", () => {
  test.use({ javaScriptEnabled: false });

  test("/unauthorized is noindex and has none of the home's metadata", async ({ page }) => {
    const response = await page.goto("/unauthorized", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    await expect(meta(page, "name", "robots")).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(meta(page, "name", "description")).toHaveCount(0);
    await expect(meta(page, "property", "og:url")).toHaveCount(0);
  });

  for (const path of ["/this-page-does-not-exist", "/work/this-case-does-not-exist"]) {
    test(`${path} answers 404, noindex, with none of the home's metadata`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(404);
      await expect(meta(page, "name", "robots").first()).toHaveAttribute("content", /noindex/);
      await expect(page).toHaveTitle("Page not found · Erick Mahecha");
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      await expect(meta(page, "name", "description")).toHaveCount(0);
      await expect(meta(page, "property", "og:url")).toHaveCount(0);
    });
  }
});

test("every share picture answers as an image", async ({ request, browserName }, testInfo) => {
  // Once per run: /api/og/generate allows 30 pictures a minute per IP.
  test.skip(
    browserName !== "chromium" || testInfo.project.name !== "chromium",
    "downloaded once, in the chromium project",
  );
  test.setTimeout(240_000);

  const pictures = new Set<string>();
  for (const { path } of await readSitemap(request)) {
    const html = await (await request.get(path)).text();
    const tag = html.match(/<meta[^>]*property="og:image"[^>]*>/)?.[0] ?? "";
    const url = tag.match(/content="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
    expect.soft(url, `${path}: og:image`).toBeTruthy();
    if (url) pictures.add(url);
  }

  for (const url of pictures) {
    const drawn = url.includes("/api/og/generate");
    const response = await request.get(relOnSite(url));
    expect.soft(response.status(), url).toBe(200);
    // On Vercel a missing file can answer with the 404 page: the type tells.
    expect.soft(response.headers()["content-type"] ?? "", url).toMatch(/^image\//);
    expect.soft((await response.body()).length, url).toBeGreaterThan(1000);
    // Keeps the run well under the route's limit.
    if (drawn) await new Promise((resolve) => setTimeout(resolve, 2100));
  }
});
