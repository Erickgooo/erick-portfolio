/**
 * A date as readers see it on the site, e.g. "January 6, 2026". A bare
 * YYYY-MM-DD is read as that day at local midnight, so it never shows as the
 * day before.
 */
export function formatDate(date: string): string {
  const day = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  return day.toLocaleString("en-us", { month: "long", day: "numeric", year: "numeric" });
}
