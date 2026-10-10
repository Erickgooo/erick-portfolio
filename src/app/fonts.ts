// Font declarations. Geist for headings and body, Geist Mono for figures —
// chosen by Erick on 2026-10-09 for the landing redesign; this replaces the
// brand manual's Space Grotesk / Inter / JetBrains Mono trio.
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
import { Geist, Geist_Mono } from "next/font/google";

export const heading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});
