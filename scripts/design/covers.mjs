// Covers made in code (no generative images): the three posts of 2026-11-03,
// the home's picture for shared links, and, from a running build, the case
// covers whose scene changed and the bench's print of the Samsung scene.
//
//   node scripts/design/covers.mjs                 # posts + social preview
//   node scripts/design/covers.mjs --scenes http://localhost:3100
//
// Posts: public/images/blog/<name>.webp, 1200 x 1600 (the ratio of the first
// post's cover). Each is drawn in the site's line style (hairline objects on
// paper, the cobalt accent, Montserrat Black and Poppins from
// src/resources/fonts) as a small diagram of the post's idea.
// Social preview: public/images/og/social-preview.jpg, 1200 x 630 (JPEG:
// link crawlers and the Satori renderer do not all read WebP).
// Scenes: each case scene's final state (reduced motion, light theme) shot at
// device scale 3, as the case covers of 2026-11-02 were: the cover is the
// scene centred on its own paper at 2400 x 1357; the bench print is the scene
// alone at 1080 x 1350.
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const args = process.argv.slice(2);
const sceneBase = args.includes("--scenes") ? args[args.indexOf("--scenes") + 1] : null;
const root = process.cwd();
// Inlined as data URLs: a page set from a string cannot load file:// URLs.
const dataUrl = (file, type) =>
  `data:${type};base64,${readFileSync(path.join(root, file)).toString("base64")}`;
const font = (file) => dataUrl(path.join("src/resources/fonts", file), "font/woff2");
const avatar = dataUrl("public/images/avatar.jpg", "image/jpeg");

const BASE_CSS = `
@font-face { font-family: "Montserrat"; src: url("${font("montserrat-900-latin.woff2")}"); font-weight: 900; }
@font-face { font-family: "Poppins"; src: url("${font("poppins-400-latin.woff2")}"); font-weight: 400; }
@font-face { font-family: "Poppins"; src: url("${font("poppins-500-latin.woff2")}"); font-weight: 500; }
@font-face { font-family: "Poppins"; src: url("${font("poppins-600-latin.woff2")}"); font-weight: 600; }
:root { --page: #ffffff; --ink: #131316; --ink-2: #55555f; --rule: #d7d8df; --soft: #e7edff; --soft-2: #f3f6ff; --accent: #2d5bff; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 1600px; }
body { background: var(--page); color: var(--ink); font-family: "Poppins", sans-serif; font-weight: 400; }
.cover { position: relative; width: 1200px; height: 1600px; padding: 96px 104px; display: flex; flex-direction: column; gap: 40px; }
.kicker { font-size: 26px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-2); display: flex; align-items: center; gap: 18px; }
.kicker::before { content: ""; width: 40px; height: 4px; background: var(--accent); }
.card { border: 2px solid var(--rule); border-radius: 14px; background: var(--page); padding: 30px 34px; }
.label { font-size: 34px; font-weight: 600; line-height: 1.2; }
.note { font-size: 27px; color: var(--ink-2); line-height: 1.3; }
.tick { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 26px; font-weight: 600; flex: none; }
.cross { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--ink); color: var(--ink); font-size: 24px; font-weight: 600; flex: none; }
.row { display: flex; align-items: center; gap: 22px; }
.title { font-family: "Montserrat", sans-serif; font-weight: 900; font-size: 104px; line-height: 1.02; letter-spacing: -0.03em; margin-top: auto; }
.title em { font-style: normal; color: var(--accent); }
.sub { font-size: 30px; color: var(--ink-2); }
.arrow { width: 4px; height: 56px; background: var(--rule); margin: -12px auto; position: relative; }
.arrow::after { content: ""; position: absolute; left: 50%; bottom: -2px; translate: -50% 0; border: 12px solid transparent; border-top: 16px solid var(--rule); border-bottom: 0; }
`;

const COVERS = [
  {
    file: "multi-client-platform",
    body: `
<div class="cover">
  <p class="kicker">Insights · Product</p>
  <div class="card row" style="justify-content: space-between">
    <span><span class="label" style="display:block">Signed-in session</span><span class="note">the client comes from here</span></span>
    <span class="note" style="border:2px solid var(--rule); border-radius:999px; padding:8px 22px">Coordinator · Client A</span>
  </div>
  <div class="arrow"></div>
  <div class="card" style="background: var(--soft-2); border-color: var(--soft)">
    <span class="label" style="display:block">Tenant resolver</span>
    <span class="note">opens one client's database, never from the request</span>
  </div>
  <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 28px">
    ${["A", "B"]
      .map(
        (c, i) => `
    <div class="card" style="display:grid; justify-items:start; gap:18px">
      <svg width="88" height="100" viewBox="0 0 24 28" fill="none" stroke="${i ? "#55555f" : "#2d5bff"}" stroke-width="1.6"><ellipse cx="12" cy="5" rx="10" ry="4"/><path d="M2 5v18c0 2.2 4.5 4 10 4s10-1.8 10-4V5"/><path d="M2 11c0 2.2 4.5 4 10 4s10-1.8 10-4M2 17c0 2.2 4.5 4 10 4s10-1.8 10-4"/></svg>
      <span><span class="label" style="display:block">Client ${c}</span><span class="note">its own database</span></span>
    </div>`,
      )
      .join("")}
  </div>
  <div class="card row">
    <span class="cross">✕</span>
    <span><span class="label" style="display:block">Request for Client B</span><span class="note">refused: an unclear case is a denied case</span></span>
  </div>
  <div class="card row">
    <span class="tick">✓</span>
    <span><span class="label" style="display:block">A test for every route</span><span class="note">or a written exemption, checked by the suite</span></span>
  </div>
  <p class="title">Fails <em>closed.</em></p>
</div>`,
  },
  {
    file: "whatsapp-ai-assistants",
    body: `
<div class="cover">
  <p class="kicker">Insights · Automation</p>
  <div style="display:grid; grid-template-columns: 450px 1fr; gap: 36px; align-items:stretch">
    <div style="border:3px solid var(--ink); border-radius:56px; padding:30px 26px 40px; display:grid; align-content:start; gap:20px; background:var(--page)">
      <span style="justify-self:center; width:120px; height:12px; border-radius:6px; background:var(--ink)"></span>
      <span style="justify-self:start; max-width:340px; background:var(--soft-2); border:2px solid var(--soft); border-radius:22px 22px 22px 6px; padding:18px 22px; font-size:26px; line-height:1.3">May I save your details so an advisor can follow up?</span>
      <span style="justify-self:end; background:var(--accent); color:#fff; border-radius:22px 22px 6px 22px; padding:18px 22px; font-size:26px; font-weight:500">Yes, I agree</span>
      <span style="justify-self:start; max-width:340px; background:var(--soft-2); border:2px solid var(--soft); border-radius:22px 22px 22px 6px; padding:18px 22px; font-size:26px; line-height:1.3">Send a photo of the invoice and the phone's IMEI.</span>
      <span style="justify-self:end; background:var(--accent); color:#fff; border-radius:22px 22px 6px 22px; padding:18px 22px; font-size:26px; font-weight:500">Invoice photo</span>
      <span style="justify-self:end; background:var(--accent); color:#fff; border-radius:22px 22px 6px 22px; padding:18px 22px; font-size:24px; font-weight:500">IMEI 49 015420 323751 8</span>
      <span style="justify-self:start; max-width:340px; background:var(--soft-2); border:2px solid var(--soft); border-radius:22px 22px 22px 6px; padding:18px 22px; font-size:26px; line-height:1.3">Thanks. An advisor will take it from here.</span>
    </div>
    <div style="display:grid; gap:22px; align-content:space-between">
      ${[
        ["Consent recorded", "a no stays a no"],
        ["IMEI checked in code", "the Luhn check, not the model"],
        ["Identity verified", "by an independent second model"],
        ["Reply checked", "before it is sent"],
        ["Handed to a person", "with a verified summary"],
      ]
        .map(
          ([label, note]) => `
      <div class="card row" style="padding:24px 26px"><span class="tick">✓</span><span><span class="label" style="display:block; font-size:30px">${label}</span><span class="note" style="font-size:24px">${note}</span></span></div>`,
        )
        .join("")}
    </div>
  </div>
  <p class="title">The model talks. <em>Code decides.</em></p>
</div>`,
  },
  {
    file: "projects-with-ai-agents",
    body: `
<div class="cover">
  <p class="kicker">Insights · Operations</p>
  <div class="card">
    <span class="label" style="display:block; margin-bottom:18px">Spec</span>
    ${["Goal", "Constraints", "What done means", "Out of scope"]
      .map(
        (line) =>
          `<span class="row note" style="margin-top:10px"><i style="width:14px;height:14px;border-radius:50%;background:var(--accent);flex:none"></i>${line}</span>`,
      )
      .join("")}
  </div>
  <div class="card">
    <span class="label" style="display:block; margin-bottom:14px">Decision log</span>
    ${["D1 · the decision, and why", "D2 · the decision, and why", "D3 · the decision, and why"]
      .map(
        (line) =>
          `<span class="note" style="display:block; padding:10px 0; border-top:2px solid var(--rule)">${line}</span>`,
      )
      .join("")}
  </div>
  <div class="card">
    <span class="label" style="display:block; margin-bottom:20px">Gate</span>
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px">
      ${["Types", "Tests", "Review", "Deploy"]
        .map(
          (gate) =>
            `<span style="display:grid; justify-items:center; gap:12px; border:2px solid var(--rule); border-radius:12px; padding:20px 8px; font-size:26px; font-weight:500"><span class="tick">✓</span>${gate}</span>`,
        )
        .join("")}
    </div>
  </div>
  <p class="title">Nothing skips <em>the gate.</em></p>
</div>`,
  },
];

const SOCIAL = `
<style>
html, body { width: 1200px; height: 630px; }
body { background: #0b0b0f; color: #ffffff; }
.og { width: 1200px; height: 630px; padding: 72px 80px; display: grid; grid-template-columns: 1fr 240px; gap: 56px; align-items: center; }
.og .kicker { color: #a6a6b0; font-size: 22px; }
.og .kicker::before { background: #6688ff; }
.og h1 { font-family: "Montserrat", sans-serif; font-weight: 900; font-size: 64px; line-height: 1.04; letter-spacing: -0.025em; margin: 26px 0 30px; }
.og .who { font-size: 28px; font-weight: 600; }
.og .who span { display: block; font-weight: 400; color: #a6a6b0; font-size: 24px; margin-top: 4px; }
.og img { width: 240px; height: 240px; border-radius: 50%; object-fit: cover; }
</style>
<div class="og">
  <div>
    <p class="kicker">Growth / AI / Systems</p>
    <h1>I build the systems behind business growth.</h1>
    <p class="who">Erick Mahecha<span>Growth &amp; AI Systems Lead</span></p>
  </div>
  <img src="${avatar}" alt="">
</div>`;

async function render(browser, html, size) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>${html}</body></html>`,
    {
      waitUntil: "load",
    },
  );
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await page.close();
  return png;
}

async function scenes(browser, base) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 3,
    reducedMotion: "reduce",
    colorScheme: "light",
  });
  const page = await ctx.newPage();
  for (const slug of ["chatflow-whatsapp-ai-platform", "samsung-lifemiles-whatsapp"]) {
    await page.goto(`${base}/work/${slug}`, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content: "header, [class*='FaqChatbot'] { visibility: hidden !important; }",
    });
    const scene = page.locator("main [data-scene]").first();
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const shot = sharp(await scene.screenshot());
    const { width, height } = await shot.metadata();
    // Leave out the sheet's hairline at the edges; the paper is its corner.
    const inner = await shot
      .extract({ left: 6, top: 6, width: width - 12, height: height - 12 })
      .png()
      .toBuffer();
    const { data } = await sharp(inner)
      .extract({ left: 2, top: 2, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const paper = { r: data[0], g: data[1], b: data[2] };
    const h = Math.round(1357 * 0.92);
    const scaled = await sharp(inner).resize({ height: h }).toBuffer();
    const meta = await sharp(scaled).metadata();
    await sharp({ create: { width: 2400, height: 1357, channels: 3, background: paper } })
      .composite([
        {
          input: scaled,
          left: Math.round((2400 - meta.width) / 2),
          top: Math.round((1357 - h) / 2),
        },
      ])
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(root, `public/images/projects/incentiva/${slug}.webp`));
    if (slug === "samsung-lifemiles-whatsapp") {
      await sharp(inner)
        .resize({ width: 1080, height: 1350, fit: "contain", background: paper })
        .webp({ quality: 85, effort: 6 })
        .toFile(path.join(root, `public/images/projects/incentiva/${slug}-scene.webp`));
    }
    console.log(slug, paper);
  }
  await ctx.close();
}

const browser = await chromium.launch();
if (sceneBase) {
  await scenes(browser, sceneBase);
} else {
  await mkdir(path.join(root, "public/images/blog"), { recursive: true });
  for (const cover of COVERS) {
    const png = await render(browser, cover.body, { width: 1200, height: 1600 });
    const out = path.join(root, "public/images/blog", `${cover.file}.webp`);
    await sharp(png).webp({ quality: 88, effort: 6 }).toFile(out);
    console.log(out);
  }
  const og = await render(browser, SOCIAL, { width: 1200, height: 630 });
  const ogOut = path.join(root, "public/images/og/social-preview.jpg");
  await sharp(og).jpeg({ quality: 88, mozjpeg: true }).toFile(ogOut);
  console.log(ogOut);
}
await browser.close();
