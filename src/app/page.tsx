import { BrandStage } from "@/components/workbench/BrandStage";
import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { About } from "@/components/workbench/home/About";
import { Builds } from "@/components/workbench/home/Builds";
import { Hero } from "@/components/workbench/home/Hero";
import { Projects } from "@/components/workbench/home/Projects";
import { ToolWall } from "@/components/workbench/home/ToolWall";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata(pages.home);
}

// The home, in Workbench: Erick's work laid out as objects on a bench. The
// sections are full-bleed and set their own gutters (see SiteMain).
export default function Home() {
  return (
    <>
      <StructuredData type="WebPage" page={pages.home} />
      <Hero />
      <BrandStage place="home" />
      <Builds />
      <ToolWall />
      <Projects hideProtected={!isProtectedPath("/")} />
      <About />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
