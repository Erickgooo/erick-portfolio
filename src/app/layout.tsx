import "@/resources/base.css";
import "@/resources/custom.css";

import { body, code, heading } from "@/app/fonts";
import { FaqChatbot, Footer, Header, IntroLoader } from "@/components";
import { SiteMain } from "@/components/SiteMain";
import { SpotlightBackground } from "@/components/SpotlightBackground";
import spotlightStyles from "@/components/SpotlightBackground.module.scss";
import { GlassController } from "@/components/glass/GlassController";
import { THEME_INIT } from "@/components/themeScript";
import { profile, siteUrl } from "@/resources";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import styles from "./layout.module.scss";

// Only what every page shares. Each indexable page writes its own description,
// canonical and share card (utils/seo.tsx), so a 404 or a noindex page never
// inherits the home's.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: profile.name,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[styles.root, heading.variable, body.variable, code.variable].join(" ")}
    >
      <head>
        <script
          id="theme-init"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: the theme must be set before the first paint to avoid a light/dark flash; the script is a static string with no user input
          dangerouslySetInnerHTML={{ __html: THEME_INIT }}
        />
      </head>
      <body className={`${styles.body} ${spotlightStyles.pageDots}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <IntroLoader />
        <SpotlightBackground />
        <GlassController />
        <Header />
        <SiteMain>{children}</SiteMain>
        <Footer />
        <Analytics />
        <FaqChatbot />
      </body>
    </html>
  );
}
