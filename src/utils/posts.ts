// Posts and case studies are MDX files, one per entry, with their details in
// the front matter. This reads a folder of them for the pages, the feed, the
// sitemap and the share cards.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

export type TeamMember = { name: string; role: string; avatar: string; linkedIn: string };

export type PostMetadata = {
  title: string;
  /** YYYY-MM-DD. */
  publishedAt: string;
  summary: string;
  /** Cover for posts and shared links ("" when none). */
  image: string;
  /** A case study's pieces, in order. */
  images: string[];
  tag?: string;
  team: TeamMember[];
  link: string;
  /** A case's headline figure, "value|label", e.g. "338K+|organic views" ("" when none). */
  metric: string;
};

export type Post = { slug: string; metadata: PostMetadata; content: string };

/** Every .mdx entry in a folder, given as path segments from the project root. */
export function getPosts(folder: string[]): Post[] {
  const dir = path.join(process.cwd(), ...folder);
  if (!fs.existsSync(dir)) notFound();

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf-8"));
      return {
        slug: file.slice(0, -".mdx".length),
        content,
        metadata: {
          title: data.title ?? "",
          publishedAt: data.publishedAt,
          summary: data.summary ?? "",
          image: data.image ?? "",
          images: data.images ?? [],
          tag: typeof data.tag === "string" ? data.tag : undefined,
          team: data.team ?? [],
          link: data.link ?? "",
          metric: data.metric ?? "",
        },
      };
    });
}
