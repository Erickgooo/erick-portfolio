import { isProtectedPath, protectedRoutes } from "@/resources/protectedRoutes";
import type { ProtectedRoutesConfig } from "@/types/config.types";

const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

/** Projects that may be shown on a public page: nothing whose own page is password-protected. */
export function publicProjects<T extends { slug: string }>(
  posts: T[],
  config: ProtectedRoutesConfig = protectedRoutes,
): T[] {
  return posts.filter((post) => !isProtectedPath(`/work/${post.slug}`, config));
}

export function sortProjects<T extends { metadata: { publishedAt: string } }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );
}

/** The newest projects that may be listed in public, whether or not they carry a headline result. */
export function recentProjects<T extends { slug: string; metadata: { publishedAt: string } }>(
  posts: T[],
  count: number,
  config: ProtectedRoutesConfig = protectedRoutes,
): T[] {
  return sortProjects(publicProjects(posts, config)).slice(0, count);
}

/**
 * The project a public page may link to by slug: null when no project has that
 * slug or when its page is behind the password, so the link is left out.
 */
export function linkableProject<T extends { slug: string }>(
  posts: T[],
  slug: string,
  config: ProtectedRoutesConfig = protectedRoutes,
): T | null {
  return publicProjects(posts, config).find((post) => post.slug === slug) ?? null;
}

/** First still image of a project (case-study carousels may start with a video). */
export function coverImage(images: string[]): string | null {
  return images.find((src) => !VIDEO.test(src)) ?? null;
}

/** "value|label" → parts; null unless both are present. */
export function parseMetric(metric?: string): { value: string; label: string } | null {
  if (!metric) return null;
  const [value, label] = metric.split("|").map((s) => s.trim());
  return value && label ? { value, label } : null;
}
