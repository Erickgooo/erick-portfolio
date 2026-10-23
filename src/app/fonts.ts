// Font declarations — Manual de Marca, Sección 04:
// Space Grotesk (titulares), Inter (cuerpo/label), JetBrains Mono (datos).
//
// The three font instances live here as a single, obvious source of truth.
// `@/resources/once-ui.config.ts` re-exports them (Task 11b), and that
// barrel is imported by several client components (e.g. Header.tsx), so
// this module is NOT server-only — treat it as shared code.
//
// next/font emits `<link rel="preload" as="font">` tags for these
// declarations on Linux builds (verified in production/Vercel). Local
// Windows builds do not emit them: `.next/server/next-font-manifest.json`
// stays `"app": {}` because the webpack module-graph request string for
// next/font-processed modules on Windows uses backslashes
// (`...\next-font-loader\index.js?...`), while
// `next/dist/build/webpack/plugins/next-font-manifest-plugin.js` tests
// `mod.request.includes('/next-font-loader/index.js?')` — a
// forward-slash-only substring that can never match on Windows (matches
// vercel/next.js#57008). This is a build-host artefact, independent of
// which module holds these declarations — see docs/perf-report.md.
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Not preloaded (2026-10-22): no public page of the Workbench site renders
// text in JetBrains Mono (checked page by page with scripts/design/fonts.mjs),
// yet its 40 KB preload went out at high priority on every page, ahead of
// the first paint. The old About's sticky meta panel, whose CLS once needed
// the preload (docs/perf-report.md, Follow-up 11b), is gone. Should code text
// appear, the face still loads on demand.
export const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// The Workbench faces (redesign 2026), Montserrat Black, Poppins and
// Luxurious Roman, are not declared here: they are self-hosted in
// src/resources/fonts and declared in src/resources/custom.css (--font-wb-display,
// --font-wb-text, --font-wb-accent), so they behave the same on every build
// host (see the note above). They are not preloaded: the intro covers the
// page while they load.
