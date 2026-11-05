import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { WorkIndex } from "@/components/workbench/work/WorkIndex";
import { pages } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata(pages.work);
}

// Projects, in Workbench: every case as a print on the bench. A public page
// leaves out the cases whose own page is password-protected.
export default function Work() {
  return (
    <>
      <StructuredData type="CollectionPage" page={pages.work} />
      <WorkIndex hideProtected={!isProtectedPath(pages.work.path)} />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
