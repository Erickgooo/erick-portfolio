import { siteUrl } from "@/resources";
import type { MetadataRoute } from "next";

// What crawlers may fetch. Share cards and the feed are meant to be fetched;
// the rest of /api is not. Password-protected routes are deliberately left
// out: a Disallow line would advertise them, so middleware.ts answers them
// with `X-Robots-Tag: noindex` instead.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og/", "/api/rss"],
      disallow: ["/api/", "/unauthorized"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
