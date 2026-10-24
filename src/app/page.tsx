import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { About } from "@/components/workbench/home/About";
import { Builds } from "@/components/workbench/home/Builds";
import { Hero } from "@/components/workbench/home/Hero";
import { Projects } from "@/components/workbench/home/Projects";
import { ToolWall } from "@/components/workbench/home/ToolWall";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages, profile, protectedRoutes, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: pages.home.title,
    description: pages.home.description,
    path: pages.home.path,
    image: pages.home.image,
  });
}

// The home, in Workbench: Erick's work laid out as objects on a bench. The
// sections are full-bleed and set their own gutters (see SiteMain).
export default function Home() {
  return (
    <>
      <StructuredData
        type="WebPage"
        path={pages.home.path}
        title={pages.home.title}
        description={pages.home.description}
        author={{
          name: profile.name,
          url: `${siteUrl}${pages.about.path}`,
          image: `${siteUrl}${profile.avatar}`,
        }}
      />
      <Hero />
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
