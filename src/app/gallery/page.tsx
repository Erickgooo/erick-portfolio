import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { ClientSection } from "@/components/workbench/gallery/ClientSection";
import { Head } from "@/components/workbench/gallery/Head";
import { Viewer } from "@/components/workbench/gallery/Viewer";
import { getGalleryBench, piecesIn } from "@/components/workbench/gallery/data";
import styles from "@/components/workbench/gallery/gallery.module.scss";
import { baseURL, gallery, person } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });
}

/** A client with this many pieces or fewer is laid out compact. */
const SMALL = 3;

// Visual Work, in Workbench: the fullest bench. Every piece of
// `gallery.images`, sorted by client and format; opening one lifts it into
// the viewer. The sections are full-bleed and set their own gutters.
export default function Gallery() {
  const bench = getGalleryBench({ hideProtected: !isProtectedPath(gallery.path) });
  // Clients come largest first; the ones with a few pieces share a row on
  // wide screens instead of each leaving most of the bench empty.
  const large = bench.clients.filter((c) => piecesIn(c) > SMALL);
  const small = bench.clients.filter((c) => piecesIn(c) <= SMALL);

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <div className={styles.page}>
        <Head bench={bench} />
        {large.map((shelf, i) => (
          <ClientSection key={shelf.id} shelf={shelf} index={i} />
        ))}
        {small.length > 1 ? (
          <div className={styles.pair}>
            {small.map((shelf, i) => (
              <ClientSection key={shelf.id} shelf={shelf} index={large.length + i} compact />
            ))}
          </div>
        ) : (
          small.map((shelf, i) => (
            <ClientSection key={shelf.id} shelf={shelf} index={large.length + i} />
          ))
        )}
      </div>
      <Closing title="Want pieces like these for your brand?" />
      <Viewer pieces={bench.pieces} />
      <RevealObserver />
    </>
  );
}
