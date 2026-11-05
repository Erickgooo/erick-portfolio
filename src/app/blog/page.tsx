import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { BlogIndex } from "@/components/workbench/blog/BlogIndex";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata(pages.blog);
}

// The blog, in Workbench: the posts as printed sheets stacked on the bench. A
// public page leaves out password-protected posts.
export default function Blog() {
  return (
    <>
      <StructuredData type="CollectionPage" page={pages.blog} />
      <BlogIndex hideProtected={!isProtectedPath(pages.blog.path)} />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
