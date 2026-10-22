import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { About } from "@/components/workbench/home/About";
import { Builds } from "@/components/workbench/home/Builds";
import { Hero } from "@/components/workbench/home/Hero";
import { Projects } from "@/components/workbench/home/Projects";
import { ToolWall } from "@/components/workbench/home/ToolWall";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { about, baseURL, home, person } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

// The home, in Workbench: Erick's work laid out as objects on a bench. The
// sections are full-bleed and set their own gutters (see SiteMain).
export default function Home() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
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
