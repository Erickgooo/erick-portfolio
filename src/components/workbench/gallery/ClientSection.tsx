// Workbench, Visual Work: one client's part of the bench (sober, 2026-10-22).
// A header under a hairline with the client's name, then the pieces by
// format: videos in thin 9:16 frames, carousels as straight stacks of hairline
// sheets, single posts as framed prints on a wall of rows that keeps every
// file's own proportions. Every piece is a PieceButton that opens the viewer
// (see Viewer.tsx); nothing else here needs JavaScript.
import { youTubeThumbnail } from "@/utils/youtube";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FiArrowRight, FiLayers, FiPlay } from "react-icons/fi";
import { PieceButton } from "./PieceButton";
import { type ClientShelf, countOf, formatsLine, piecesIn } from "./data";
import styles from "./gallery.module.scss";

/** Row heights of the posts wall, per layout (see .wall in gallery.module.scss). */
const ROW = { phone: 168, tablet: 220, desk: 270, wide: 300 };

/** How wide a post renders, for the browser to pick the right file. */
function postSizes(ratio: number) {
  const px = (row: number) => `${Math.ceil(ratio * row * 1.3)}px`;
  const phoneVw = Math.min(92, Math.ceil((ratio * ROW.phone * 1.4) / 3.9));
  return [
    `(min-width: 1280px) ${px(ROW.wide)}`,
    `(min-width: 1024px) ${px(ROW.desk)}`,
    `(min-width: 720px) ${px(ROW.tablet)}`,
    `${phoneVw}vw`,
  ].join(", ");
}

function Shelf({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shelf}>
      <h3 className={styles.shelfTitle}>
        {title}
        <span>{count}</span>
      </h3>
      {children}
    </div>
  );
}

/**
 * One client. `compact` is for a client with few pieces, laid beside another
 * one on wide screens (see .pair).
 */
export function ClientSection({
  shelf,
  compact = false,
}: {
  shelf: ClientShelf;
  compact?: boolean;
}) {
  const total = piecesIn(shelf);
  const titleId = `${shelf.id}-title`;

  return (
    <section
      id={shelf.id}
      className={`${styles.client} ${compact ? styles.compact : ""}`}
      aria-labelledby={titleId}
    >
      <div className={styles.clientInner}>
        <header className={styles.divider} data-reveal="">
          <span className={styles.tab}>{countOf(total, "piece", "pieces")}</span>
          <h2 id={titleId}>{shelf.name}</h2>
          <div className={styles.dividerText}>
            <p>{formatsLine(shelf)}</p>
            {shelf.related && (
              <Link href={shelf.related.href} className={styles.related}>
                Related case: {shelf.related.title} <FiArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </header>

        {shelf.videos.length > 0 && (
          <Shelf title="Videos" count={shelf.videos.length}>
            {/* Below 1024 px the row reveals as a whole (.reelItem). */}
            <ul className={styles.reel} data-reveal="">
              {shelf.videos.map((video, i) => (
                <li
                  key={video.id}
                  className={styles.reelItem}
                  data-reveal=""
                  style={{ "--i": i % 6 } as CSSProperties}
                >
                  <PieceButton
                    className={styles.phone}
                    piece={video.id}
                    aria-haspopup="dialog"
                    aria-label={`Play video: ${video.title}`}
                  >
                    <span className={styles.screen}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- a YouTube thumbnail: next/image proxies no remote host (next.config.mjs) */}
                      <img
                        src={youTubeThumbnail(video.videoId)}
                        alt=""
                        width={480}
                        height={360}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className={styles.play} aria-hidden="true">
                        <FiPlay />
                      </span>
                    </span>
                  </PieceButton>
                  <p className={styles.caption}>{video.caption}</p>
                </li>
              ))}
            </ul>
          </Shelf>
        )}

        {shelf.decks.length > 0 && (
          <Shelf title="Carousels" count={shelf.decks.length}>
            <ul className={styles.decks}>
              {shelf.decks.map((deck, i) => {
                const cover = deck.slides[0];
                return (
                  <li
                    key={deck.id}
                    className={styles.deckItem}
                    data-reveal=""
                    style={{ "--i": i % 3 } as CSSProperties}
                  >
                    <PieceButton
                      className={styles.deck}
                      piece={deck.id}
                      aria-haspopup="dialog"
                      aria-label={`Open carousel, ${deck.slides.length} slides: ${deck.title}`}
                    >
                      <span className={`${styles.sheet} ${styles.sheetA}`} aria-hidden="true" />
                      <span className={`${styles.sheet} ${styles.sheetB}`} aria-hidden="true" />
                      <span className={styles.deckTop}>
                        <span
                          className={styles.frame}
                          style={{ aspectRatio: `${cover.w} / ${cover.h}` }}
                        >
                          <Image
                            src={cover.src}
                            width={cover.w}
                            height={cover.h}
                            alt={cover.alt}
                            sizes="(min-width: 1280px) 368px, (min-width: 1024px) 29vw, 45vw"
                          />
                        </span>
                      </span>
                      <span className={styles.count} aria-hidden="true">
                        <FiLayers />
                        {deck.slides.length} slides
                      </span>
                    </PieceButton>
                    <p className={styles.caption}>{deck.caption}</p>
                  </li>
                );
              })}
            </ul>
          </Shelf>
        )}

        {shelf.posts.length > 0 && (
          <Shelf title="Posts" count={shelf.posts.length}>
            <ul className={styles.wall}>
              {shelf.posts.map((post, i) => {
                const { w, h } = post.slide;
                const style = {
                  "--i": i % 4,
                  "--r": (w / h).toFixed(4),
                } as CSSProperties;
                return (
                  <li key={post.id} className={styles.wallItem} data-reveal="" style={style}>
                    <PieceButton
                      className={styles.post}
                      piece={post.id}
                      aria-haspopup="dialog"
                      aria-label={`Open image: ${post.title}`}
                    >
                      <span className={styles.frame} style={{ aspectRatio: `${w} / ${h}` }}>
                        <Image
                          src={post.slide.src}
                          width={w}
                          height={h}
                          alt={post.slide.alt}
                          sizes={postSizes(w / h)}
                        />
                      </span>
                    </PieceButton>
                  </li>
                );
              })}
            </ul>
          </Shelf>
        )}
      </div>
    </section>
  );
}
