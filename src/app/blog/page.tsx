import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { BlogIndex } from "@/components/workbench/blog/BlogIndex";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages, profile, protectedRoutes, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: pages.blog.title,
    description: pages.blog.description,
    path: pages.blog.path,
  });
}

// The blog, in Workbench: the posts as printed sheets stacked on the bench. A
// public page leaves out password-protected posts.
export default function Blog() {
  return (
    <>
      <StructuredData
        type="BlogPosting"
        title={pages.blog.title}
        description={pages.blog.description}
        path={pages.blog.path}
        author={{
          name: profile.name,
          url: `${siteUrl}/blog`,
          image: `${siteUrl}${profile.avatar}`,
        }}
      />
      <BlogIndex hideProtected={!isProtectedPath(pages.blog.path)} />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
