import { pages, profile, protectedRoutes, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";
import { NextResponse } from "next/server";

/** Escape text interpolated into XML so titles containing &, < or > cannot break the feed. */
function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // Password-protected posts are left out: titles and summaries are content too.
  const posts = getPosts(["src", "app", "blog", "posts"]).filter(
    (post) => !isProtectedPath(`/blog/${post.slug}`),
  );

  // Sort posts by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(pages.blog.title)}</title>
    <link>${escapeXml(siteUrl)}/blog</link>
    <description>${escapeXml(pages.blog.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/api/rss" rel="self" type="application/rss+xml" />
    <managingEditor>${escapeXml(profile.email || "noreply@example.com")} (${escapeXml(profile.name)})</managingEditor>
    <webMaster>${escapeXml(profile.email || "noreply@example.com")} (${escapeXml(profile.name)})</webMaster>
    <image>
      <url>${escapeXml(siteUrl)}${escapeXml(profile.avatar || "/images/avatar.jpg")}</url>
      <title>${escapeXml(pages.blog.title)}</title>
      <link>${escapeXml(siteUrl)}/blog</link>
    </image>
    ${sortedPosts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${escapeXml(siteUrl)}/blog/${escapeXml(post.slug)}</link>
      <guid>${escapeXml(siteUrl)}/blog/${escapeXml(post.slug)}</guid>
      <pubDate>${new Date(post.metadata.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[${String(post.metadata.summary ?? "").replace(/]]>/g, "]]&gt;")}]]></description>
      ${post.metadata.image ? `<enclosure url="${escapeXml(siteUrl)}${escapeXml(post.metadata.image)}" type="image/jpeg" />` : ""}
      ${post.metadata.tag ? `<category>${escapeXml(post.metadata.tag)}</category>` : ""}
      <author>${escapeXml(profile.email || "noreply@example.com")} (${escapeXml(profile.name)})</author>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  // Return the RSS XML with the appropriate content type
  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
