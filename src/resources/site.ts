// The site's settings: its address, its pages (the path, the name on the
// header key, and the title and description for search results and shared
// links), which pages are on, what the header shows, and where a post can
// be shared.
import { profile, profileLinks } from "./profile";

export const siteUrl = "https://erickmahecha.com";

export type PagePath = `/${string}`;

export type Page = {
  path: PagePath;
  label: string;
  title: string;
  description: string;
  /** Picture for shared links, under public/; otherwise one is drawn from the title. */
  image?: string;
};

export const pages = {
  home: {
    path: "/",
    label: "Home",
    title: `${profile.name} · ${profile.role}`,
    description:
      "Erick Mahecha, Growth & AI Systems Lead: acquisition, CRM automation, WhatsApp AI assistants and production software, built into systems teams can actually run.",
    image: "/images/og/social-preview.jpg",
  },
  about: {
    path: "/about",
    label: "About",
    title: "About",
    description: `${profile.name}, ${profile.role} in ${profile.location}: experience, resume, skills and certifications.`,
  },
  work: {
    path: "/work",
    label: "Projects",
    title: "Projects",
    description:
      "Case studies by Erick Mahecha in acquisition, automation, product and operations: WhatsApp AI assistants, multi-client platforms, paid media and the software behind them.",
  },
  blog: {
    path: "/blog",
    label: "Blog",
    title: "Insights",
    description:
      "Notes from building growth systems: multi-client platforms, WhatsApp AI assistants and running projects with AI agents",
  },
  gallery: {
    path: "/gallery",
    label: "Visual Work",
    title: "Visual Work",
    description:
      "Paid ad creatives, short-form video and AI-generated content produced for real campaigns, with AI generation models and traditional editing tools.",
  },
} satisfies Record<string, Page>;

/**
 * The route for someone reviewing Erick's profile (a recruiter, a hiring
 * manager): the work experience on About, with the resume at its top. The
 * header, the hero and every closing link to it; "Book a call" is the route
 * for hiring him.
 */
export const experience = {
  label: "Experience & Resume",
  href: "/about#experience",
  /** The id of the experience section on About. */
  anchor: "experience",
};

/** The pages that are on. A page that is off answers as not found. */
export const enabledRoutes: Record<PagePath, boolean> = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/gallery": true,
};

/** What the header shows besides the page keys. */
export const headerShows = {
  location: true,
  time: true,
  themeKey: true,
};

/** The share keys under a post. */
export const sharing = {
  enabled: true,
  on: {
    x: true,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: false,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

/** Erick's profile URLs for schema.org sameAs (web links only, no mailto). */
export const sameAs: string[] = profileLinks
  .map((link) => link.href)
  .filter((href) => href.startsWith("http"));
