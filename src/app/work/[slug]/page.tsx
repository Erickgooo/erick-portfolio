import { ScrollToHash } from "@/components/ScrollToHash";
import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { CaseBody, CaseHeader, NextCase } from "@/components/workbench/work/CaseStudy";
import { getCase, getNextCase } from "@/components/workbench/work/cases";
import { pages } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/posts";
import { StructuredData, entryPage, pageMetadata } from "@/utils/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "work", "projects"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = getPosts(["src", "app", "work", "projects"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return pageMetadata(entryPage(post, pages.work.path));
}

// A case study, in Workbench: opened like a project folder (see CaseStudy).
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const post = getPosts(["src", "app", "work", "projects"]).find((post) => post.slug === slugPath);
  const c = getCase(slugPath);

  if (!post || !c) {
    notFound();
  }

  // From a public case, the next-case link skips password-protected cases.
  const next = getNextCase(c.slug, { hideProtected: !isProtectedPath(c.href) });

  return (
    <>
      <StructuredData type="Article" page={entryPage(post, pages.work.path)} parent={pages.work} />
      <article>
        <CaseHeader c={c} />
        <CaseBody c={c} />
      </article>
      {next ? <NextCase next={next} /> : null}
      <Closing />
      <RevealObserver />
      <SceneDriver />
      <ScrollToHash />
    </>
  );
}
