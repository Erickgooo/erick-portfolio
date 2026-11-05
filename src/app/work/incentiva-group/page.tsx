import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { IncentivaIndex } from "@/components/workbench/work/IncentivaIndex";
import { pages } from "@/resources";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata(pages.incentiva);
}

// The Incentiva Group index (2026-11-02): the role, its seven case studies and
// every project by area of responsibility.
export default function IncentivaGroup() {
  return (
    <>
      <StructuredData type="CollectionPage" page={pages.incentiva} parent={pages.work} />
      <IncentivaIndex />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
