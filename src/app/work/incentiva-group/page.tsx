import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { IncentivaIndex } from "@/components/workbench/work/IncentivaIndex";
import { pages, profile, siteUrl } from "@/resources";
import { incentivaRole } from "@/resources/incentiva";
import { StructuredData, pageMetadata } from "@/utils/seo";

const PATH = `${pages.work.path}/incentiva-group`;
const TITLE = "Incentiva Group";
const DESCRIPTION =
  "Every project of Erick Mahecha's role as Operations Manager at Incentiva Group: in-house software, client operations, paid media, proposals, brand and compliance, with seven case studies.";

export async function generateMetadata() {
  return pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });
}

// The Incentiva Group index (2026-11-02): the role, its seven case studies and
// every project by area of responsibility.
export default function IncentivaGroup() {
  return (
    <>
      <StructuredData
        type="WebPage"
        path={PATH}
        title={`${incentivaRole.company}: ${incentivaRole.title}`}
        description={DESCRIPTION}
        author={{
          name: profile.name,
          url: `${siteUrl}${pages.about.path}`,
          image: `${siteUrl}${profile.avatar}`,
        }}
      />
      <IncentivaIndex />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
