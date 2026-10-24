import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { ClientSection } from "@/components/workbench/gallery/ClientSection";
import { Head } from "@/components/workbench/gallery/Head";
import { Making } from "@/components/workbench/gallery/Making";
import { Viewer } from "@/components/workbench/gallery/Viewer";
import { getGalleryBench, piecesIn } from "@/components/workbench/gallery/data";
import styles from "@/components/workbench/gallery/gallery.module.scss";
import { SceneDriver } from "@/components/workbench/scenes/SceneDriver";
import { pages, profile, protectedRoutes, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { StructuredData, pageMetadata } from "@/utils/seo";

export async function generateMetadata() {
  return pageMetadata({
    title: pages.gallery.title,
    description: pages.gallery.description,
    path: pages.gallery.path,
  });
}

/** A client with this many pieces or fewer is laid out compact. */
const SMALL = 3;

// Visual Work, in sober Workbench: the fullest bench. Every piece of
// `galleryPieces`, sorted by client and format; opening one lifts it into
// the viewer; then how the pieces are made (a stepper of scenes). The
// sections are full-bleed and set their own gutters.
export default function Gallery() {
  const bench = getGalleryBench({ hideProtected: !isProtectedPath(pages.gallery.path) });
  // Clients come largest first; the ones with a few pieces share a row on
  // wide screens instead of each leaving most of the bench empty.
  const large = bench.clients.filter((c) => piecesIn(c) > SMALL);
  const small = bench.clients.filter((c) => piecesIn(c) <= SMALL);

  return (
    <>
      <StructuredData
        type="WebPage"
        title={pages.gallery.title}
        description={pages.gallery.description}
        path={pages.gallery.path}
        author={{
          name: profile.name,
          url: `${siteUrl}${pages.gallery.path}`,
          image: `${siteUrl}${profile.avatar}`,
        }}
      />
      <div className={styles.page}>
        <Head bench={bench} />
        {large.map((shelf) => (
          <ClientSection key={shelf.id} shelf={shelf} />
        ))}
        {small.length > 1 ? (
          <div className={styles.pair}>
            {small.map((shelf) => (
              <ClientSection key={shelf.id} shelf={shelf} compact />
            ))}
          </div>
        ) : (
          small.map((shelf) => <ClientSection key={shelf.id} shelf={shelf} />)
        )}
      </div>
      <Making />
      <Closing title="Want pieces like these for your brand?" />
      <Viewer pieces={bench.pieces} />
      <RevealObserver />
      <SceneDriver />
    </>
  );
}
