import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { WorkIndex } from "@/components/workbench/work/WorkIndex";
import { pages, profile, protectedRoutes, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: pages.work.title,
    description: pages.work.description,
    path: pages.work.path,
  });
}

// Projects, in Workbench: every case as a print on the bench. A public page
// leaves out the cases whose own page is password-protected.
export default function Work() {
  return (
    <>
      <StructuredData
        type="WebPage"
        path={pages.work.path}
        title={pages.work.title}
        description={pages.work.description}
        author={{
          name: profile.name,
          url: `${siteUrl}${pages.about.path}`,
          image: `${siteUrl}${profile.avatar}`,
        }}
      />
      <WorkIndex hideProtected={!isProtectedPath(pages.work.path)} />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
