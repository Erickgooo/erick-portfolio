import { ScrollToHash } from "@/components/ScrollToHash";
import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { PostArticle } from "@/components/workbench/blog/PostArticle";
import { RecentPosts } from "@/components/workbench/blog/RecentPosts";
import { getPostCards } from "@/components/workbench/blog/posts";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { BLOG_DIR, getPosts } from "@/utils/posts";
import { StructuredData, entryPage, pageMetadata } from "@/utils/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(BLOG_DIR);
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

  const posts = getPosts(BLOG_DIR);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return pageMetadata(entryPage(post, pages.blog.path));
}

// A post, in Workbench (see PostArticle), then the most recent other posts.
export default async function Blog({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const post = getPosts(BLOG_DIR).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const recent = getPostCards({
    hideProtected: !isProtectedPath(`${pages.blog.path}/${post.slug}`),
    exclude: [post.slug],
  }).slice(0, 2);

  return (
    <>
      <StructuredData
        type="BlogPosting"
        page={entryPage(post, pages.blog.path)}
        parent={pages.blog}
      />
      <PostArticle
        title={post.metadata.title}
        summary={post.metadata.summary}
        publishedAt={post.metadata.publishedAt}
        image={post.metadata.image}
        content={post.content}
        url={`${siteUrl}${pages.blog.path}/${post.slug}`}
        slug={post.slug}
      />
      <RecentPosts posts={recent} />
      <Closing />
      <RevealObserver />
      <SceneDriver />
      <ScrollToHash />
    </>
  );
}
