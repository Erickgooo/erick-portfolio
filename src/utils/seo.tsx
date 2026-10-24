// Search and sharing: a page's <head> metadata (title, description, the Open
// Graph and X card) and its schema.org description as JSON-LD.
import { siteUrl } from "@/resources";
import type { Metadata } from "next";

/** An absolute URL on the site for a path; an absolute URL stays as it is. */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${siteUrl}${pathOrUrl}`;
}

/** The picture /api/og/generate draws for a title. */
export function ogImage(title: string): string {
  return `/api/og/generate?title=${encodeURIComponent(title)}`;
}

type PageInfo = {
  title: string;
  description: string;
  path: string;
  /** Picture for shared links; drawn from the title when absent or empty. */
  image?: string;
};

export function pageMetadata({ title, description, path, image }: PageInfo): Metadata {
  const url = path === "/" ? siteUrl : absoluteUrl(path);
  const picture = absoluteUrl(image || ogImage(title));
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: picture, alt: title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [picture],
    },
  };
}

type StructuredDataProps = PageInfo & {
  type: "WebPage" | "BlogPosting";
  author: { name: string; url: string; image: string };
  datePublished?: string;
  dateModified?: string;
  /** The author's profile URLs. */
  sameAs?: string[];
};

/** The page described for search engines, in the server HTML. */
export function StructuredData({
  type,
  title,
  description,
  path,
  image,
  author,
  datePublished,
  dateModified,
  sameAs = [],
}: StructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": type,
    url: absoluteUrl(path),
    headline: title,
    description,
    image: absoluteUrl(image || ogImage(title)),
    ...(datePublished ? { datePublished, dateModified: dateModified ?? datePublished } : {}),
    sameAs,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
      image: { "@type": "ImageObject", url: author.image },
    },
  };
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from the site's own data; "<" is escaped so no text can close the tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
