// The site's settings: its address, its pages (the path, the name on the
// header key, and the title and description for search results and shared
// links), which pages are on, what the header shows, and where a post can
// be shared.
import { profile, profileLinks } from "./profile";

/** The address the site answers on; everything public is written with it. */
export const siteUrl = "https://www.erickmahecha.com";

export type PagePath = `/${string}`;

export type Page = {
  path: PagePath;
  label: string;
  title: string;
  description: string;
  /** Picture for shared links, under public/; otherwise one is drawn from the title. */
  image?: string;
  /**
   * When this page's content last changed, YYYY-MM-DD: the sitemap's lastmod and
   * the schema.org dateModified. Written by hand (Vercel clones with partial
   * history, so a build cannot read git), and only for a change a reader would
   * notice: not for formatting, re-encoded media or chrome shared by every page.
   */
  modifiedAt: string;
};

export const pages = {
  home: {
    path: "/",
    label: "Home",
    title: `${profile.name} · ${profile.role}`,
    description:
      "Erick Mahecha, Growth & AI Systems Lead. From growth operations and AI automation to production software: strategy, architecture and delivery.",
    image: "/images/og/social-preview.jpg",
    modifiedAt: "2026-11-04",
  },
  about: {
    path: "/about",
    label: "About",
    title: "About",
    description: `${profile.name}, ${profile.role} in ${profile.location}: experience, resume, skills and certifications.`,
    modifiedAt: "2026-11-03",
  },
  work: {
    path: "/work",
    label: "Projects",
    title: "Projects",
    description:
      "Case studies by Erick Mahecha in acquisition, automation, product and operations: WhatsApp AI assistants, multi-client platforms and paid media.",
    modifiedAt: "2026-11-04",
  },
  blog: {
    path: "/blog",
    label: "Blog",
    title: "Insights",
    description:
      "Notes from building growth systems: multi-client platforms, WhatsApp AI assistants and running projects with AI agents",
    modifiedAt: "2026-11-03",
  },
  gallery: {
    path: "/gallery",
    label: "Visual Work",
    title: "Visual Work",
    description:
      "Paid ad creatives, short-form video and AI-generated content produced for real campaigns, with AI generation models and traditional editing tools.",
    modifiedAt: "2026-11-03",
  },
  incentiva: {
    path: "/work/incentiva-group",
    label: "Incentiva Group",
    title: "Incentiva Group",
    description:
      "Erick Mahecha's role as Operations Manager at Incentiva Group: in-house software, client operations, paid media, brand and compliance, with seven case studies.",
    modifiedAt: "2026-11-03",
  },
} satisfies Record<string, Page>;

/** The pages that are on. A page that is off answers as not found. */
export const enabledRoutes: Record<PagePath, boolean> = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/gallery": true,
};

/** Erick's profile URLs for schema.org sameAs (web links only, no mailto). */
export const sameAs: string[] = profileLinks
  .map((link) => link.href)
  .filter((href) => href.startsWith("http"));
