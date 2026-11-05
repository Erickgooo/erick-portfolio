import { ScrollToHash } from "@/components/ScrollToHash";
import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { Credentials } from "@/components/workbench/about/Credentials";
import { Experience } from "@/components/workbench/about/Experience";
import { Film } from "@/components/workbench/about/Film";
import { Intro } from "@/components/workbench/about/Intro";
import { Skills } from "@/components/workbench/about/Skills";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages } from "@/resources";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata(pages.about);
}

// About, in Workbench: the name and the offer, then the loop that used to open
// the home, opening from a print on the bench into a wide frame, the story under
// it, the work as ticket stubs, the skills sheet, the studies and certificates,
// and the closing call. The sections are full-bleed and set their own gutters
// (see SiteMain).
export default function About() {
  return (
    <>
      <StructuredData type="ProfilePage" page={pages.about} />
      <Intro />
      <Film />
      <Experience />
      <Skills />
      <Credentials />
      <Closing />
      <RevealObserver />
      <SceneDriver />
      <ScrollToHash />
    </>
  );
}
