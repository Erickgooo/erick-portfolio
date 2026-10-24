import createMDX from "@next/mdx";

// .md and .mdx files can be pages too; the posts and case studies themselves
// are read at build time and rendered with next-mdx-remote.
const withMDX = createMDX({ extension: /\.mdx?$/ });

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is required for script-src because the theme-init script in
 * layout.tsx and Next.js's own bootstrap are inlined without a nonce. Switching
 * to nonces means generating one per request in middleware, which opts every
 * page out of static generation — not a trade worth making for a portfolio.
 * `'unsafe-eval'` is added in development only, for Fast Refresh.
 * `script-src-attr 'none'` still blocks inline event-handler attributes
 * (onclick="…"), the usual shape of an injected-markup XSS; React attaches its
 * handlers in JavaScript and is unaffected.
 *
 * Every host listed is one the site really loads from. Add a host here only
 * together with the feature that needs it:
 *   - i.ytimg.com / www.youtube-nocookie.com: YouTubeFacade thumbnails and player
 *   - va.vercel-scripts.com: @vercel/analytics (debug script outside Vercel)
 *   - enabling the Mailchimp newsletter needs `form-action` + your list-manage.com host
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://va.vercel-scripts.com",
  "frame-src https://www.youtube-nocookie.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt and braces alongside frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // Deny every powerful feature the site does not use. autoplay, fullscreen,
    // encrypted-media and picture-in-picture are left at their defaults because
    // the YouTube player is granted them through the iframe `allow` attribute.
    value: [
      "accelerometer=()",
      "bluetooth=()",
      "browsing-topics=()",
      "camera=()",
      "display-capture=()",
      "geolocation=()",
      "gyroscope=()",
      "hid=()",
      "interest-cohort=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "serial=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  // Isolate the browsing context from windows opened by, or opening, other origins.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  poweredByHeader: false,
  // Route handlers that read MDX at request time need those files shipped with
  // their serverless function; file tracing cannot see paths built at runtime.
  // (Pages are prerendered at build time and do not need this.)
  outputFileTracingIncludes: {
    "/api/og/generate": ["./src/app/blog/posts/**/*.mdx", "./src/app/work/projects/**/*.mdx"],
    "/api/rss": ["./src/app/blog/posts/**/*.mdx"],
  },
  // Source maps would publish the original, commented source of every client bundle.
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // No remote hosts: every optimized image is a local file. An entry here
    // turns /_next/image into a proxy for that host, so add one only for a
    // host you actually load images from, with the narrowest pathname.
    remotePatterns: [],
  },
  // Strict CSS chunking keeps each route's CSS modules out of the chunks every
  // page loads (loose chunking merged home, About and gallery styles into /work).
  // Authorized by the user on 2026-10-22; CSP and headers are untouched.
  experimental: {
    cssChunking: "strict",
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withMDX(nextConfig);
