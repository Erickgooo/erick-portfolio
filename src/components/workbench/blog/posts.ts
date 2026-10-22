// Workbench, Blog: the posts as the pages list them, from the MDX frontmatter.
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";
import { type Size, mediaSize } from "../prose/media";

export type PostCard = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  publishedAt: string;
  tag: string;
  image: (Size & { src: string }) | null;
};

export function readPosts() {
  return getPosts(["src", "app", "blog", "posts"]).sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );
}

/**
 * The posts, newest first, as cards (no body). With `hideProtected` (set when
 * the page listing them is public), a password-protected post is left out.
 */
export function getPostCards({
  hideProtected,
  exclude = [],
}: {
  hideProtected: boolean;
  exclude?: string[];
}): PostCard[] {
  return readPosts()
    .filter((post) => !exclude.includes(post.slug))
    .filter((post) => !hideProtected || !isProtectedPath(`/blog/${post.slug}`))
    .map(({ slug, metadata }) => ({
      slug,
      href: `/blog/${slug}`,
      title: metadata.title,
      summary: metadata.summary,
      publishedAt: metadata.publishedAt,
      // The frontmatter reader defaults a missing tag to an empty list.
      tag: typeof metadata.tag === "string" ? metadata.tag : "",
      image: metadata.image ? { src: metadata.image, ...mediaSize(metadata.image) } : null,
    }));
}
