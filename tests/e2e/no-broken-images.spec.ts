import { expect, test } from "./fixtures";

test("no page in the sitemap has a broken image", async ({ page, request, baseURL }) => {
  test.setTimeout(180_000);
  const xml = await (await request.get("/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(paths.length).toBeGreaterThan(5);

  const failures: string[] = [];
  page.on("response", (res) => {
    if (res.request().resourceType() === "image" && res.status() >= 400) {
      failures.push(`${res.status()} ${res.url()}`);
    }
  });

  for (const p of paths) {
    await page.goto(new URL(p, baseURL).toString());
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    await page.waitForLoadState("networkidle");
    const broken = await page.$$eval("img", (imgs) =>
      imgs
        .filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith("data:"))
        .map((i) => i.currentSrc || i.src),
    );
    failures.push(...broken.map((b) => `${p}: ${b}`));
  }
  for (const api of ["/api/rss", "/api/og/generate?title=QA"]) {
    const res = await request.get(api);
    if (res.status() !== 200) failures.push(`${res.status()} ${api}`);
  }
  expect(failures).toEqual([]);
});
