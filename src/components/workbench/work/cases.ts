// Workbench, Projects: every case study as the pages need it. Every value comes
// from the project MDX (frontmatter and body) or src/resources/content.tsx.
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";
import type { Paper } from "../data";
import { type Size, isImage, isVideo, mediaSize } from "../prose/media";
import { bodyMediaPaths } from "../prose/source";

export type CaseMedia = Size & { src: string; kind: "image" | "video" };

export type Case = {
  slug: string;
  href: string;
  title: string;
  /** The part of the title before the colon: the client or the product. */
  name: string;
  /** The part after it. */
  subtitle: string;
  summary: string;
  publishedAt: string;
  role: string;
  client: string;
  metric: { value: string; label: string } | null;
  cover: CaseMedia | null;
  /** Frontmatter media the body does not show itself, laid out beside the text. */
  extras: CaseMedia[];
  paper: Paper;
  content: string;
};

/**
 * Who each case was for, as named in the experience list of content.tsx. A
 * case missing here shows the name from its title.
 */
const CLIENT: Record<string, string> = {
  "leadbot-ai": "Artesa Panadería",
  "atv-riders": "Cuatrimotos ATV Riders",
  "dakoma-roofing": "Dakoma Roofing",
  "ai-powered-ad-creatives": "Quick Metal Shop and Dakoma Roofing",
  "quick-metal-shop-viral-videos": "Quick Metal Shop",
  "quick-metal-shop-arquiexpo": "Quick Metal Shop",
  "quick-metal-shop-marketing": "Quick Metal Shop",
  "quick-metal-shop-the-brand-comes-to-life": "Quick Metal Shop",
  "ai-portfolio": "Personal project",
};

/** Papers dealt in turn down the list, so no two neighbours match in one, two or three columns. */
const PAPERS: Paper[] = ["ink", "mist", "cobalt", "paper"];

function media(src: string): CaseMedia {
  return { src, ...mediaSize(src), kind: isVideo(src) ? "video" : "image" };
}

function readCases(): Case[] {
  const posts = getPosts(["src", "app", "work", "projects"]).sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );
  return posts.map((post, i) => {
    const { metadata, content, slug } = post;
    const [name, ...rest] = metadata.title.split(":");
    const [value, label] = (metadata.metric || "").split("|").map((s) => s.trim());
    const images = metadata.images.filter((src) => isImage(src) || isVideo(src));
    const coverSrc = images.find(isImage);
    const inBody = bodyMediaPaths(content);
    return {
      slug,
      href: `/work/${slug}`,
      title: metadata.title,
      name: name.trim(),
      subtitle: rest.join(":").trim(),
      summary: metadata.summary,
      publishedAt: metadata.publishedAt,
      role: metadata.team[0]?.role ?? "",
      client: CLIENT[slug] ?? name.trim(),
      metric: value && label ? { value, label } : null,
      cover: coverSrc ? media(coverSrc) : null,
      extras: images.filter((src) => src !== coverSrc && !inBody.has(src)).map(media),
      paper: PAPERS[i % PAPERS.length],
      content,
    };
  });
}

/**
 * The cases, newest first. With `hideProtected` (set when the page listing
 * them is public), a case whose own page is password-protected is left out,
 * the rule of the home's project fan.
 */
export function getCases({ hideProtected }: { hideProtected: boolean }): Case[] {
  const cases = readCases();
  return hideProtected ? cases.filter((c) => !isProtectedPath(c.href)) : cases;
}

export function getCase(slug: string): Case | undefined {
  return readCases().find((c) => c.slug === slug);
}

/** The case after this one in the list, wrapping to the first. */
export function getNextCase(slug: string, { hideProtected }: { hideProtected: boolean }) {
  const cases = getCases({ hideProtected });
  const others = cases.filter((c) => c.slug !== slug);
  if (others.length === 0) return undefined;
  const at = cases.findIndex((c) => c.slug === slug);
  return at < 0 ? others[0] : cases[(at + 1) % cases.length];
}

/** "July 2026", from the frontmatter date, the same on the server and in any timezone. */
export function monthYear(date: string): string {
  const [year, month] = date.split("-").map(Number);
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return month >= 1 && month <= 12 ? `${names[month - 1]} ${year}` : date;
}
