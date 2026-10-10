const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

export function sortProjects<T extends { metadata: { publishedAt: string } }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );
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
