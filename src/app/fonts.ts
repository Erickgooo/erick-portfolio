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

// Measured with `preload: false` first (JetBrains Mono isn't visually used
// above the fold on Home/Gallery), but Lighthouse's layout-shifts audit then
// attributed a residual 0.033 About-mobile CLS to this exact font file
// swapping in late on the sticky meta panel. Preloading it removes that
// shift; see docs/perf-report.md, Follow-up 11b, for the measurements.
export const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});
