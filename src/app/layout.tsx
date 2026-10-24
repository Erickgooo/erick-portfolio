import "@/resources/base.css";
import "@/resources/custom.css";

import { body, code, heading } from "@/app/fonts";
import { FaqChatbot, Footer, Header, IntroLoader } from "@/components";
import { SiteMain } from "@/components/SiteMain";
import { SpotlightBackground } from "@/components/SpotlightBackground";
import spotlightStyles from "@/components/SpotlightBackground.module.scss";
import { THEME_INIT } from "@/components/themeScript";
import { pages } from "@/resources";
import { pageMetadata } from "@/utils/seo";
import { Analytics } from "@vercel/analytics/next";
import styles from "./layout.module.scss";

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
      </head>
      <body className={`${styles.body} ${spotlightStyles.pageDots}`}>
        <IntroLoader />
        <SpotlightBackground />
        <Header />
        <SiteMain>{children}</SiteMain>
        <Footer />
        <Analytics />
        <FaqChatbot />
      </body>
    </html>
  );
}
