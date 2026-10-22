import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";

import classNames from "classnames";

import { body, code, heading } from "@/app/fonts";
import { FaqChatbot, Footer, Header, IntroLoader, Providers } from "@/components";
import { SiteMain } from "@/components/SiteMain";
import { SpotlightBackground } from "@/components/SpotlightBackground";
import spotlightStyles from "@/components/SpotlightBackground.module.scss";
import { baseURL, dataStyle, home, style } from "@/resources";
import { Background, Column, Flex, Meta, RevealFx, SpacingToken } from "@once-ui-system/core";
import { Analytics } from "@vercel/analytics/next";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      className={classNames(heading.variable, body.variable, code.variable)}
    >
      <head>
        <script
          id="theme-init"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: the theme must be applied before first paint to avoid a light/dark flash; the script body is a static string built from our own config, with no user input
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  const defaultTheme = 'system';
                  
                  // Set defaults from config
                  const config = ${JSON.stringify({
                    brand: style.brand,
                    accent: style.accent,
                    neutral: style.neutral,
                    solid: style.solid,
                    "solid-style": style.solidStyle,
                    border: style.border,
                    surface: style.surface,
                    transition: style.transition,
                    scaling: style.scaling,
                    "viz-style": dataStyle.variant,
                  })};
                  
                  // Apply default values
                  Object.entries(config).forEach(([key, value]) => {
                    root.setAttribute('data-' + key, value);
                  });
                  
                  // Resolve theme
                  const resolveTheme = (themeValue) => {
                    if (!themeValue || themeValue === 'system') {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return themeValue;
                  };
                  
                  // Apply saved theme
                  const savedTheme = localStorage.getItem('data-theme');
                  const resolvedTheme = resolveTheme(savedTheme);
                  root.setAttribute('data-theme', resolvedTheme);
                  
                  // Apply any saved style overrides
                  const styleKeys = Object.keys(config);
                  styleKeys.forEach(key => {
                    const value = localStorage.getItem('data-' + key);
                    if (value) {
                      root.setAttribute('data-' + key, value);
                    }
                  });
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        {/* TEMPORARY (sober variants): ?v=b shows variant B of the sober
            preview on the home and the LeadBot case, with no parameter
            variant A. It sets an attribute before first paint, so the pages
            stay statically rendered. Step 4 removes it; never on main. */}
        <script
          id="wb-variant"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: TEMPORARY (sober variants): a static string with no user input; it only reads the query string to pick between two fixed values
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.setAttribute('data-wb-variant',new URLSearchParams(location.search).get('v')==='b'?'b':'a')}catch(e){}",
          }}
        />
      </head>
      <Providers>
        <Column
          as="body"
          background="page"
          fillWidth
          // The font variables also go on <body>: Once UI's tokens declare
          // `:root { --font-heading: var(--font-heading) }` (same for body,
          // label, code), which empties next/font's variables on <html> when
          // that stylesheet lands after the font one, and Next's CSS chunking
          // does not keep a fixed order. On <body> they win whatever the order.
          className={classNames(
            spotlightStyles.pageDots,
            heading.variable,
            body.variable,
            code.variable,
          )}
          style={{ minHeight: "100vh", position: "relative" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <IntroLoader />
          <SpotlightBackground />
          <Flex fillWidth minHeight="16" s={{ hide: true }} />
          <Header />
          <SiteMain>{children}</SiteMain>
          <Footer />
          <Analytics />
          <FaqChatbot />
        </Column>
      </Providers>
    </Flex>
  );
}
