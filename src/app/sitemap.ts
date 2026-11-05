// /sitemap.xml: the pages that are on, every post and every case study.
// Password-protected paths are never listed: a slug is content too.
import { type Page, enabledRoutes, pages, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/posts";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const dated = (page: Page) => ({ path: page.path as string, lastModified: page.modifiedAt });

  const pagesOn = [pages.home, pages.about, pages.work, pages.blog, pages.gallery]
    .filter((page) => enabledRoutes[page.path])
    .map(dated);

  const entries = (folder: string[], base: string) =>
    getPosts(folder).map((post) => ({
      path: `${base}/${post.slug}`,
      lastModified: post.metadata.modifiedAt,
    }));

  // Pages under /work that are not case studies: the Incentiva Group index.
  const workIndexes = enabledRoutes[pages.work.path] ? [dated(pages.incentiva)] : [];

  return [
    ...pagesOn,
    ...entries(["src", "app", "blog", "posts"], pages.blog.path),
    ...entries(["src", "app", "work", "projects"], pages.work.path),
    ...workIndexes,
  ]
    .filter((entry) => !isProtectedPath(entry.path))
    .map(({ path, lastModified }) => ({
      url: path === "/" ? siteUrl : `${siteUrl}${path}`,
      lastModified,
    }));
}
