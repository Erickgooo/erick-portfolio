import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { WorkIndex } from "@/components/workbench/work/WorkIndex";
import { about, baseURL, person, work } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: work.title,
    description: work.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(work.title)}`,
    path: work.path,
  });
}

// Projects, in Workbench: every case as a print on the bench. A public page
// leaves out the cases whose own page is password-protected.
export default function Work() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <WorkIndex hideProtected={!isProtectedPath(work.path)} />
      <Closing />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
