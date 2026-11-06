// Search and sharing: a page's <head> metadata (title, description, canonical,
// the Open Graph and X card) and its schema.org description as JSON-LD.
import { pages, profile, sameAs, siteUrl } from "@/resources";
import { incentivaRole } from "@/resources/incentiva";
import type { Post } from "@/utils/posts";
import type { Metadata } from "next";

/** An absolute URL on the site for a path; an absolute URL stays as it is. */
function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return pathOrUrl === "/" ? siteUrl : `${siteUrl}${pathOrUrl}`;
}

/**
 * A page's title in the browser tab, search results and shared links: its own
 * title followed by Erick's name ("About · Erick Mahecha"), unless it already
 * carries the name (the home's "Erick Mahecha · Growth & AI Systems Lead").
 */
export function fullTitle(title: string): string {
  return title.includes(profile.name) ? title : `${title} · ${profile.name}`;
}

/** The picture /api/og/generate draws for a title. */
function ogImage(title: string): string {
  return `/api/og/generate?title=${encodeURIComponent(title)}`;
}

/** What search results and share cards need to know about a page. */
type PageInfo = {
  /** The page's own title, on screen; the drawn share card takes this one. */
  title: string;
  /** The title in search results, published as it is, instead of the full title. */
  seoTitle?: string;
  description: string;
  path: string;
  /** Picture for shared links; drawn from the title when absent or empty. */
  image?: string;
  /** YYYY-MM-DD; a page with a publication date is an article. */
  publishedAt?: string;
  /** YYYY-MM-DD, when its content last changed. */
  modifiedAt: string;
};

/** A case study or post as a page: its front matter, with the search-only fields first. */
export function entryPage(post: Post, base: string): PageInfo {
  const { title, seoTitle, seoDescription, summary, image, publishedAt, modifiedAt } =
    post.metadata;
  return {
    title,
    seoTitle,
    description: seoDescription ?? summary,
    path: `${base}/${post.slug}`,
    image,
    publishedAt,
    modifiedAt,
  };
}

const FEED_PATH = "/api/rss";

export function pageMetadata({
  title,
  seoTitle,
  description,
  path,
  image,
  publishedAt,
  modifiedAt,
}: PageInfo): Metadata {
  const url = absoluteUrl(path);
  // The drawn card takes the page's own title (the route only draws titles
  // it knows); everything a person reads takes the full one.
  const picture = absoluteUrl(image || ogImage(title));
  const full = seoTitle ?? fullTitle(title);
  return {
    title: full,
    description,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": [
          { url: absoluteUrl(FEED_PATH), title: fullTitle(pages.blog.title) },
        ],
      },
    },
    openGraph: {
      title: full,
      description,
      url,
      siteName: profile.name,
      locale: "en_US",
      images: [{ url: picture, alt: full }],
      ...(publishedAt
        ? {
            type: "article" as const,
            publishedTime: publishedAt,
            modifiedTime: modifiedAt,
            authors: [absoluteUrl(pages.about.path)],
          }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: [picture],
    },
  };
}

/** The one Person every page describes, referred to by this id. */
const PERSON_ID = `${siteUrl}/#person`;
const WEBSITE_ID = `${siteUrl}/#website`;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: profile.name,
  jobTitle: profile.role,
  url: siteUrl,
  image: absoluteUrl(profile.avatar),
  sameAs,
  worksFor: { "@type": "Organization", name: incentivaRole.company },
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: siteUrl,
  name: profile.name,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

/** The trail from the home to a page, through its parent when it has one. */
function breadcrumbs(page: PageInfo, parent?: Pick<PageInfo, "title" | "path">) {
  const trail = [
    { name: pages.home.label, path: pages.home.path as string },
    ...(parent ? [{ name: parent.title, path: parent.path }] : []),
    { name: page.title, path: page.path },
  ];
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(page.path)}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

type StructuredDataProps = {
  type: "WebPage" | "ProfilePage" | "CollectionPage" | "Article" | "BlogPosting";
  page: PageInfo;
  /** The section above the page in its breadcrumb trail. */
  parent?: Pick<PageInfo, "title" | "path">;
};

/** The page's schema.org graph, in the server HTML. */
export function StructuredData({ type, page, parent }: StructuredDataProps) {
  const url = absoluteUrl(page.path);
  const isHome = page.path === pages.home.path;
  const isArticle = type === "Article" || type === "BlogPosting";

  const main = isArticle
    ? {
        "@type": type,
        "@id": `${url}#article`,
        url,
        mainEntityOfPage: url,
        headline: page.title,
        description: page.description,
        image: absoluteUrl(page.image || ogImage(page.title)),
        datePublished: page.publishedAt,
        dateModified: page.modifiedAt,
        inLanguage: "en",
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      }
    : {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name: page.seoTitle ?? fullTitle(page.title),
        description: page.description,
        dateModified: page.modifiedAt,
        inLanguage: "en",
        ...(type === "ProfilePage"
          ? { mainEntity: { "@id": PERSON_ID } }
          : { author: { "@id": PERSON_ID } }),
        ...(isHome ? { isPartOf: { "@id": WEBSITE_ID }, about: { "@id": PERSON_ID } } : {}),
      };

  const graph = [main, person, ...(isHome ? [website] : [breadcrumbs(page, parent)])];

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from the site's own data; "<" is escaped so no text can close the tag
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
