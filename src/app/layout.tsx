import "@/resources/base.css";
import "@/resources/custom.css";

import { body, code, heading } from "@/app/fonts";
import { FaqChatbot, Footer, Header, IntroLoader } from "@/components";
import { SiteMain } from "@/components/SiteMain";
import { SpotlightBackground } from "@/components/SpotlightBackground";
import spotlightStyles from "@/components/SpotlightBackground.module.scss";
import { GlassController } from "@/components/glass/GlassController";
import { THEME_INIT } from "@/components/themeScript";
import { pages } from "@/resources";
import { pageMetadata } from "@/utils/seo";
import { Analytics } from "@vercel/analytics/next";
import styles from "./layout.module.scss";

// TEMPORARY (liquid glass variants): the variant on <html data-lg>, before
// the first paint.
const LG_VARIANT =
  'try{var v=new URLSearchParams(location.search).get("v");document.documentElement.setAttribute("data-lg",v==="b"?"b":"a")}catch(e){}';

export async function generateMetadata() {
  return pageMetadata({
    title: pages.home.title,
    description: pages.home.description,
    path: pages.home.path,
    image: pages.home.image,
  });
}

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
        {/* TEMPORARY (liquid glass variants): ?v=b shows variant b, anything
            else variant a. Never reaches main. */}
        <script
          id="lg-variant"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a static string with no user input, set before the first paint like theme-init
          dangerouslySetInnerHTML={{ __html: LG_VARIANT }}
        />
      </head>
      <body className={`${styles.body} ${spotlightStyles.pageDots}`}>
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
