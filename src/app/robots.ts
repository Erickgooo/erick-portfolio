import { baseURL } from "@/resources";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        // Social cards and the feed are meant to be fetched; the rest of /api is not.
        allow: ["/", "/api/og/", "/api/rss"],
        // Password-protected routes are deliberately NOT listed here: a Disallow
        // line would advertise them. They answer with `X-Robots-Tag: noindex`
        // from middleware.ts instead.
        disallow: ["/api/", "/unauthorized"],
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
