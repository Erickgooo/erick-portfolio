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

/**
 * The still pictures of a project, in its own order. Its media list may also
 * hold clips; a list of projects shows none of them, so that nothing on it
 * plays or has to load a video.
 */
export function projectStills(images: string[]): string[] {
  return images.filter((src) => !isClip(src));
}

/** Whether an entry of a project's media list is a clip rather than a picture. */
export function isClip(src: string): boolean {
  return VIDEO.test(src);
}

/**
 * The still that stands for a clip until it is played: its first frame, kept
 * beside it as `<name>-poster.webp`. A clip on a page loads nothing before
 * that, so this is all there is to see of it. Made with
 * `ffmpeg -i <name>.mp4 -frames:v 1 -c:v libwebp -quality 80 <name>-poster.webp`.
 */
export function clipPoster(src: string): string {
  return src.replace(/\.[^./]+$/, "-poster.webp");
}

/**
 * What a case study still has to show once its hero and its body are done:
 * every entry of the media list after the first, in the project's own order,
 * leaving out the ones the body already embeds.
 */
export function remainingMedia(images: string[], body: string): string[] {
  return images.slice(1).filter((src) => !body.includes(src));
}

/** First still image of a project (its media list may start with a video). */
export function coverImage(images: string[]): string | null {
  return projectStills(images)[0] ?? null;
}

/** "value|label" → parts; null unless both are present. */
export function parseMetric(metric?: string): { value: string; label: string } | null {
  if (!metric) return null;
  const [value, label] = metric.split("|").map((s) => s.trim());
  return value && label ? { value, label } : null;
}
