// The resume, public/resume/Erick_Mahecha_Resume.pdf, rebuilt from the site's
// own data so the PDF and About never disagree: the umbrella title from
// src/resources/profile.ts, and the roles, bullets, skills, studies and
// certifications from src/resources/about.tsx. HTML printed to PDF by the
// Playwright Chromium already in the repo: selectable text, the site's fonts
// embedded (Montserrat Black, Poppins), US Letter, at most two pages.
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

// What the PDF says that the site does not: the contact line of the previous
// resume, where each role was, the years of the studies, and how many of an
// earlier role's About bullets fit two pages (indices into its achievements,
// in the order they print).
const PHONE = "+57 313 468 7899";
const PORTFOLIO = "https://erickmahecha.com";
const PLACES = {
  "Incentiva Group": "Medellín, Colombia (hybrid)",
  "Quick Metal Shop": "Puerto Rico, USA (remote)",
  "Dakoma Roofing": "Florida, USA (remote)",
  "Cuatrimotos ATV Riders": "Bogotá, Colombia",
  "Artesa Panadería": "Bogotá, Colombia",
  Aseneg: "Bogotá, Colombia",
  Concentrix: "Bogotá, Colombia",
};
const YEARS = {
  "Universidad Piloto de Colombia": "2020 – 2025",
  SENA: "2017 – 2018",
};
const PICK = {
  "Quick Metal Shop": [8, 5, 6, 1],
  "Dakoma Roofing": [0, 2],
  "Cuatrimotos ATV Riders": [0],
  "Artesa Panadería": [0],
  Aseneg: [0],
  Concentrix: [0, 3],
};
const SKILL_GROUPS = [
  "Product & Engineering Leadership",
  "Software & Cloud",
  "Automation, AI & Systems",
  "Marketing, Growth & Commercial",
];

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
const dash = (timeframe) => timeframe.replace(/\s+-\s+/, " – ");

const fontData = (file) =>
  `data:font/woff2;base64,${readFileSync(path.join(root, "src/resources/fonts", file)).toString("base64")}`;

const linkedin = profileLinks.find((l) => l.name === "LinkedIn")?.href ?? "";
const languages = profile.languages
  .map((l) =>
    profile.languageLevels?.[l] ? `${l} (${profile.languageLevels[l]})` : `${l} (native)`,
  )
  .join(" · ");

const jobs = about.experience.jobs.map((job, i) => {
  const bullets =
    i === 0 ? job.achievements : (PICK[job.company] ?? []).map((k) => job.achievements[k]);
  return `
  <section class="job">
    <header>
      <h3>${escapeHtml(job.role)} <span class="at">· ${escapeHtml(job.company)}</span></h3>
      <p class="when">${escapeHtml(dash(job.timeframe))}<span>${escapeHtml(PLACES[job.company] ?? "")}</span></p>
    </header>
    <ul>${bullets
      .filter(Boolean)
      .map((b) => `<li>${html(b)}</li>`)
      .join("")}</ul>
  </section>`;
});

const skills = about.skills.groups
  .filter((g) => SKILL_GROUPS.includes(g.title))
  .map((g) => `<p><strong>${escapeHtml(g.title)}:</strong> ${html(g.description)}</p>`)
  .join("");

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(profile.firstName)} ${escapeHtml(profile.lastName)} · Resume</title>
<style>
@font-face { font-family: "Montserrat"; src: url("${fontData("montserrat-900-latin.woff2")}"); font-weight: 900; }
@font-face { font-family: "Poppins"; src: url("${fontData("poppins-400-latin.woff2")}"); font-weight: 400; }
@font-face { font-family: "Poppins"; src: url("${fontData("poppins-500-latin.woff2")}"); font-weight: 500; }
@font-face { font-family: "Poppins"; src: url("${fontData("poppins-600-latin.woff2")}"); font-weight: 600; }
@page { size: Letter; margin: 0.45in 0.5in; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Poppins", sans-serif; font-size: 8.4pt; line-height: 1.4; color: #131316; }
a { color: inherit; text-decoration: none; }
.metric { font-weight: 600; }
h1 { font-family: "Montserrat", sans-serif; font-weight: 900; font-size: 21pt; letter-spacing: -0.02em; line-height: 1.05; }
.title { font-size: 11.5pt; font-weight: 600; color: #2d5bff; margin-top: 3pt; }
.contact { margin-top: 5pt; color: #55555f; font-size: 8.4pt; }
.contact a { color: #131316; border-bottom: 0.6pt solid #2d5bff; }
h2 { font-size: 8.4pt; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #55555f; margin: 12pt 0 5pt; padding-bottom: 3pt; border-bottom: 0.7pt solid #d7d8df; }
.summary { font-size: 8.9pt; }
.job { margin-bottom: 7pt; break-inside: avoid; }
.job header { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
h3 { font-size: 9.6pt; font-weight: 600; }
h3 .at { font-weight: 500; color: #55555f; }
.when { text-align: right; font-size: 8.2pt; color: #55555f; white-space: nowrap; }
.when span { display: block; }
ul { margin: 2pt 0 0 12pt; }
li { margin-top: 1.6pt; padding-left: 2pt; }
li::marker { color: #2d5bff; }
.skills p { margin-top: 2.5pt; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18pt; }
.muted { color: #55555f; }
</style></head>
<body>
  <header>
    <h1>${escapeHtml(profile.firstName)} ${escapeHtml(profile.lastName)}</h1>
    <p class="title">${escapeHtml(profile.role)}</p>
    <p class="contact">${escapeHtml(profile.location)} · <a href="mailto:${profile.email}">${escapeHtml(profile.email)}</a> · ${escapeHtml(PHONE)} · <a href="${linkedin}">LinkedIn</a> · <a href="${PORTFOLIO}">erickmahecha.com</a></p>
  </header>

  <h2>Profile</h2>
  <p class="summary">I build the systems behind business growth, from acquisition and CRM automation to WhatsApp AI assistants and production software. As Operations Manager at Incentiva Group I run the company's in-house software (a field-sales app, a client portal and a WhatsApp AI platform) as product owner and technical lead, directing AI-assisted development from review to App Store release, and lead brand and go-to-market work. Before that, as the sole marketer at Quick Metal Shop, I built its marketing from zero and ran an AI video production pipeline end to end: <span class="metric">338K+</span> organic views with $0 ad spend.</p>

  <h2>Experience</h2>
  ${jobs.join("")}

  <h2>Skills</h2>
  <div class="skills">${skills}</div>

  <div class="two">
    <div>
      <h2>Education</h2>
      ${about.education.schools
        .map(
          (s) =>
            `<p><strong>${escapeHtml(s.name)}</strong> · ${html(s.description)} ${YEARS[s.name] ? `<span class="muted">${YEARS[s.name]}</span>` : ""}</p>`,
        )
        .join("")}
    </div>
    <div>
      <h2>Languages</h2>
      <p>${escapeHtml(languages)}</p>
    </div>
  </div>

  <h2>Certifications</h2>
  <p>${about.certifications.items.map((c) => `${escapeHtml(c.name)} <span class="muted">(${escapeHtml(c.institution)})</span>`).join(" · ")}</p>
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
