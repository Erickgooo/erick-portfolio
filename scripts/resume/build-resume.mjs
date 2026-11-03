// The resume, public/resume/Erick_Mahecha_Resume.pdf, rebuilt from the site's
// own data so the PDF and About never disagree: the umbrella title from
// src/resources/profile.ts, and the roles, bullets, skills, studies and
// certifications from src/resources/about.tsx. HTML printed to PDF by the
// Playwright Chromium already in the repo: selectable text, US Letter, at
// most two pages.
//
// The look is the original resume's (the Word PDF in production until
// 2026-11-03, `git show c17e168:public/resume/Erick_Mahecha_Resume.pdf`):
// one serif face in black, the name in bold capitals, section heads in bold
// capitals over a grey rule, the company in bold with the role in grey bold
// italics under it, dates in italics on the right, round bullets, and the
// sections in its order (profile, experience, technical stack, education,
// certifications, languages). The original used Times New Roman, which is not
// in the repo and may not be shipped with it; Tinos (SIL OFL 1.1, metric-
// compatible with Times New Roman) stands in for it, from ./fonts. The head
// (name, title, contact line) is centred, as Erick asked on 2026-11-03.
//
//   node scripts/resume/build-resume.mjs
//
// The data files are TypeScript with JSX, so they are compiled first with the
// repo's own TypeScript into a temporary folder and rendered with react-dom.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = process.cwd();
const require = createRequire(import.meta.url);
const OUT = path.join(root, "public/resume/Erick_Mahecha_Resume.pdf");
const FONTS = path.join(root, "scripts/resume/fonts");

// What the PDF says that the site does not: the contact line of the previous
// resume, where each role and school was, the years of the studies, and how
// many of an earlier role's About bullets fit two pages (indices into its
// achievements, in the order they print). The current role prints them all.
// Each earlier role opens with its bullet of most business impact, with a
// figure already published on the site where one exists (Erick, 2026-11-03):
// Quick Metal Shop's 338K+ organic views, ATV Riders' 200+ leads a day,
// Artesa's 85% and Concentrix's Top Performer award. Dakoma and Aseneg have no
// published result, so their bullets stay as they were.
const PHONE = "+57 313 468 7899";
const PORTFOLIO = "https://erickmahecha.com";
const PLACES = {
  "Incentiva Group": "Medellín, Colombia (Hybrid)",
  "Quick Metal Shop": "Puerto Rico, USA (Remote)",
  "Dakoma Roofing": "Florida, USA (Remote)",
  "Cuatrimotos ATV Riders": "Bogotá, Colombia",
  "Artesa Panadería": "Bogotá, Colombia",
  Aseneg: "Bogotá, Colombia",
  Concentrix: "Bogotá, Colombia",
};
const SCHOOLS = {
  "Universidad Piloto de Colombia": { place: "Bogotá, Colombia", years: "2020 – 2025" },
  SENA: { place: "Bogotá, Colombia", years: "2017 – 2018" },
};
const PICK = {
  "Quick Metal Shop": [0, 1, 7, 9],
  "Dakoma Roofing": [0],
  "Cuatrimotos ATV Riders": [4],
  "Artesa Panadería": [0],
  Aseneg: [0],
  Concentrix: [3, 0],
};
const SKILL_GROUPS = [
  "Product & Engineering Leadership",
  "Software & Cloud",
  "Automation, AI & Systems",
  "Marketing & Growth",
];

// The profile, written for the resume (About's intro is a longer story). It
// frames Erick as the umbrella title, names the clients only as work done at
// Incentiva Group, and cites only the three client figures Erick authorized.
const PROFILE =
  "As a Growth & AI Systems Lead, I design and run the systems that turn acquisition, sales and customer service into repeatable growth: paid-media funnels, CRM automation, WhatsApp AI assistants and the production software behind them. At Incentiva Group I lead that work for brands such as Samsung, Nequi, Wompi and Colmaíz (Ingredion): 2M+ LifeMiles miles were awarded to buyers through the WhatsApp chatbot of the Samsung × LifeMiles promotion, and the Colmaíz assistant has reached 35,000+ contacts and served 6,000+ of them. My criterion is the same at every scale: start from how the operation really works, automate what a system can run reliably, measure it end to end, and keep people in control where the risk is. A marketing background and hands-on product and engineering leadership let me design the strategy and the systems that run it together.";

function compileData() {
  // Inside node_modules, so the compiled files resolve react from the repo.
  const cache = path.join(root, "node_modules", ".cache");
  mkdirSync(cache, { recursive: true });
  const dir = mkdtempSync(path.join(cache, "resume-"));
  execFileSync(
    process.execPath,
    [
      require.resolve("typescript/bin/tsc"),
      "--jsx",
      "react-jsx",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--target",
      "es2020",
      "--esModuleInterop",
      "--skipLibCheck",
      "--outDir",
      dir,
      path.join(root, "src/resources/about.tsx"),
      path.join(root, "src/resources/profile.ts"),
    ],
    { stdio: "inherit" },
  );
  return dir;
}

const dir = compileData();
let about;
let profile;
let profileLinks;
try {
  ({ about } = require(path.join(dir, "about.js")));
  ({ profile, profileLinks } = require(path.join(dir, "profile.js")));
} finally {
  // The modules are loaded; the compiled copies are not needed any more.
  rmSync(dir, { recursive: true, force: true });
}

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const html = (node) =>
  typeof node === "string"
    ? escapeHtml(node)
    : renderToStaticMarkup(React.createElement(React.Fragment, null, node));
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// The original spells the months out: "Jan 2026 - July 2026" prints as
// "January 2026 – July 2026".
const MONTHS = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Sept: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};
const when = (timeframe) =>
  timeframe
    .replace(/\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\b/g, (m) => MONTHS[m])
    .replace(/\s+-\s+/, " – ");

const fontData = (file) =>
  `data:font/woff2;base64,${readFileSync(path.join(FONTS, file)).toString("base64")}`;

const linkedin = profileLinks.find((l) => l.name === "LinkedIn")?.href ?? "";
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const languages = profile.languages
  .map(
    (l) =>
      `<p><strong>${escapeHtml(l)}:</strong> ${escapeHtml(capitalize(profile.languageLevels?.[l] ?? "native"))}</p>`,
  )
  .join("");

const jobs = about.experience.jobs.map((job, i) => {
  const bullets =
    i === 0 ? job.achievements : (PICK[job.company] ?? []).map((k) => job.achievements[k]);
  return `
  <section class="job">
    <div class="row"><h3>${escapeHtml(job.company)}</h3><p class="date">${escapeHtml(when(job.timeframe))}</p></div>
    <div class="row"><p class="role">${escapeHtml(job.role)}</p><p class="place">${escapeHtml(PLACES[job.company] ?? "")}</p></div>
    <ul>${bullets
      .filter(Boolean)
      .map((b) => `<li>${html(b)}</li>`)
      .join("")}</ul>
  </section>`;
});

// A group whose description has labelled lines (<strong>Label:</strong> …<br />)
// prints one bullet per line, so every bullet of the stack reads "Label: items".
const stack = about.skills.groups
  .filter((g) => SKILL_GROUPS.includes(g.title))
  .flatMap((g) => {
    const markup = html(g.description);
    const lines = markup.split(/<br\s*\/?>/).map((l) => l.trim());
    if (lines.length > 1 && lines.every((l) => l.startsWith("<strong>"))) {
      return lines.map(
        (l) => `<li>${l.replace(/^<strong>(.*?)<\/strong>/, "<strong>$1</strong>")}</li>`,
      );
    }
    return [`<li><strong>${escapeHtml(g.title)}:</strong> ${markup}</li>`];
  })
  .join("");

const schools = about.education.schools
  .map((s) => {
    const extra = SCHOOLS[s.name];
    const degree = html(s.description).replace(/\.\s*$/, "");
    return `<p><strong>${escapeHtml(s.name)}</strong> · ${degree}${extra ? ` · ${escapeHtml(extra.place)} · ${escapeHtml(extra.years)}` : ""}</p>`;
  })
  .join("");

const certifications = about.certifications.items
  .map((c) => `<li>${escapeHtml(c.name)} — ${escapeHtml(c.institution)}</li>`)
  .join("");

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(profile.firstName)} ${escapeHtml(profile.lastName)} · Resume</title>
<style>
@font-face { font-family: "Tinos"; src: url("${fontData("tinos-latin-400-normal.woff2")}"); font-weight: 400; font-style: normal; }
@font-face { font-family: "Tinos"; src: url("${fontData("tinos-latin-400-italic.woff2")}"); font-weight: 400; font-style: italic; }
@font-face { font-family: "Tinos"; src: url("${fontData("tinos-latin-700-normal.woff2")}"); font-weight: 700; font-style: normal; }
@font-face { font-family: "Tinos"; src: url("${fontData("tinos-latin-700-italic.woff2")}"); font-weight: 700; font-style: italic; }
/* The original's page: Letter, 0.625 in at the sides. */
@page { size: Letter; margin: 0.42in 0.625in 0.4in; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Tinos", serif; font-size: 10pt; line-height: 1.15; color: #000000; }
a { color: inherit; text-decoration: none; }
.metric { font-weight: 700; }
header { text-align: center; }
h1 { font-size: 16pt; font-weight: 700; text-transform: uppercase; line-height: 1.1; }
.title { font-size: 11pt; font-style: italic; margin-top: 2pt; }
.contact { font-size: 9pt; margin-top: 3pt; }
.contact .link { color: #0563c1; text-decoration: underline; }
h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; color: #1f1f1f; break-after: avoid; margin-top: 10.5pt; padding-bottom: 1.5pt; border-bottom: 0.7pt solid #999999; }
h2 + * { margin-top: 6pt; }
.job { margin-top: 9pt; }
h2 + .job { margin-top: 11pt; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
h3 { font-size: 11pt; font-weight: 700; }
.date { font-style: italic; white-space: nowrap; }
.role { font-weight: 700; font-style: italic; color: #444444; }
.place { font-size: 9pt; color: #444444; white-space: nowrap; }
ul { list-style: none; margin-top: 3.5pt; }
li { position: relative; padding-left: 36pt; margin-top: 3.5pt; }
li:first-child { margin-top: 0; }
li::before { content: ""; position: absolute; left: 19pt; top: 3.3pt; width: 4.6pt; height: 4.6pt; border-radius: 50%; background: #000000; }
.job h3, .job .row { break-after: avoid; }
.lines p + p { margin-top: 1.5pt; }
p, li { orphans: 2; widows: 2; }
/* The certifications run in two columns, so the resume keeps to two pages. */
ul.columns { columns: 2; column-gap: 12pt; break-inside: avoid; }
ul.columns li { margin-top: 0; padding-bottom: 2.4pt; padding-left: 26pt; }
ul.columns li::before { left: 9pt; }
</style></head>
<body>
  <header>
    <h1>${escapeHtml(profile.firstName)} ${escapeHtml(profile.lastName)}</h1>
    <p class="title">${escapeHtml(profile.role)}</p>
    <p class="contact">${escapeHtml(profile.location)} · <a href="mailto:${profile.email}">${escapeHtml(profile.email)}</a> · ${escapeHtml(PHONE)} · <a class="link" href="${linkedin}">LinkedIn</a> · <a class="link" href="${PORTFOLIO}">Portfolio</a></p>
  </header>

  <h2>Professional Profile</h2>
  <p>${escapeHtml(PROFILE)}</p>

  <h2>Professional Experience</h2>
  ${jobs.join("")}

  <h2>Technical Stack</h2>
  <ul>${stack}</ul>

  <h2>Education</h2>
  <div class="lines">${schools}</div>

  <h2>Certifications</h2>
  <ul class="columns">${certifications}</ul>

  <h2>Languages</h2>
  <div class="lines">${languages}</div>
</body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent(page, { waitUntil: "load" });
await tab.evaluate(() => document.fonts.ready);
const pdf = await tab.pdf({
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
  outline: false,
});
await browser.close();
writeFileSync(OUT, pdf);
const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
console.log(`${OUT}: ${pages} page(s), ${pdf.length} bytes`);
if (pages > 2) {
  console.error("The resume runs over two pages: trim PICK or SKILL_GROUPS.");
  process.exitCode = 1;
}
