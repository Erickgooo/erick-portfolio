import { ScrollToHash } from "@/components/ScrollToHash";
import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { CaseBody, CaseHeader, NextCase } from "@/components/workbench/work/CaseStudy";
import { getCase, getNextCase } from "@/components/workbench/work/cases";
import { about, baseURL, person, work } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";
import { Meta, Schema } from "@once-ui-system/core";
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

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image:
      post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    path: `${work.path}/${post.slug}`,
  });
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
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={
          post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
        }
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
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
