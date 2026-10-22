import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { Credentials } from "@/components/workbench/about/Credentials";
import { Experience } from "@/components/workbench/about/Experience";
import { Film } from "@/components/workbench/about/Film";
import { Intro } from "@/components/workbench/about/Intro";
import { Skills } from "@/components/workbench/about/Skills";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { about, baseURL, person, sameAs } from "@/resources";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

// About, in Workbench: the name and the offer, then the loop that used to open
// the home, opening from a print on the bench into a wide frame, the story under
// it, the work as ticket stubs, the skills sheet, the studies and certificates,
// and the closing call. The sections are full-bleed and set their own gutters
// (see SiteMain).
export default function About() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        sameAs={sameAs}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Intro />
      <Film />
      <Experience />
      <Skills />
      <Credentials />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
