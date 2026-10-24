// The blog's RSS 2.0 feed at /api/rss, newest post first. Password-protected
// posts are left out: their titles and summaries are content too.
import { pages, profile, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/posts";
import { NextResponse } from "next/server";

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/** Text safe inside XML, so a title with & or < cannot break the feed. */
const xml = (value: string) => value.replace(/[&<>"']/g, (char) => ENTITIES[char]);

/** Text kept verbatim inside CDATA (a literal "]]>" would end it early). */
const cdata = (value: string) => `<![CDATA[${value.replace(/]]>/g, "]]&gt;")}]]>`;

export async function GET() {
  const blogUrl = `${siteUrl}${pages.blog.path}`;
  const author = `${xml(profile.email)} (${xml(profile.name)})`;

  const posts = getPosts(["src", "app", "blog", "posts"])
    .filter((post) => !isProtectedPath(`${pages.blog.path}/${post.slug}`))
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
    );

  const items = posts.map(({ slug, metadata }) => {
    const link = `${blogUrl}/${xml(slug)}`;
    return [
      "    <item>",
      `      <title>${xml(metadata.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid>${link}</guid>`,
      `      <pubDate>${new Date(metadata.publishedAt).toUTCString()}</pubDate>`,
      `      <description>${cdata(metadata.summary)}</description>`,
      metadata.image
        ? `      <enclosure url="${siteUrl}${xml(metadata.image)}" type="image/jpeg" />`
        : "",
      metadata.tag ? `      <category>${xml(metadata.tag)}</category>` : "",
      `      <author>${author}</author>`,
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xml(pages.blog.title)}</title>`,
    `    <link>${blogUrl}</link>`,
    `    <description>${xml(pages.blog.description)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />`,
    `    <managingEditor>${author}</managingEditor>`,
    `    <webMaster>${author}</webMaster>`,
    "    <image>",
    `      <url>${siteUrl}${xml(profile.avatar)}</url>`,
    `      <title>${xml(pages.blog.title)}</title>`,
    `      <link>${blogUrl}</link>`,
    "    </image>",
    ...items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
