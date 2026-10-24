// /sitemap.xml: the pages that are on, every post and every case study.
// Password-protected paths are never listed: a slug is content too.
import { type PagePath, enabledRoutes, pages, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/posts";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().slice(0, 10);

  const pagesOn = (Object.keys(enabledRoutes) as PagePath[])
    .filter((path) => enabledRoutes[path])
    .map((path) => ({ path: path as string, lastModified: today }));

  const entries = (folder: string[], base: string) =>
    getPosts(folder).map((post) => ({
      path: `${base}/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    }));

  return [
    ...pagesOn,
    ...entries(["src", "app", "blog", "posts"], pages.blog.path),
    ...entries(["src", "app", "work", "projects"], pages.work.path),
  ]
    .filter((entry) => !isProtectedPath(entry.path))
    .map(({ path, lastModified }) => ({
      url: path === "/" ? siteUrl : `${siteUrl}${path}`,
      lastModified,
    }));
}
