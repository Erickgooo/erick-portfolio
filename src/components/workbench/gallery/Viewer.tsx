"use client";

// Workbench, Visual Work: the viewer. Opening any piece on the bench lifts it
// to the middle of the screen over a dimmed bench, in a native modal <dialog>
// (focus stays inside, Escape closes, the page behind is inert). One instance
// serves the whole page: each print is a PieceButton, which asks for its
// piece through open.ts. A video's player is
// mounted only here, after the visitor asked for it; a carousel is a scroll-
// snap track (swipe), with keys and the arrow keys to deal through it.
import { youTubeEmbedUrl } from "@/utils/youtube";
import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";
import type { Piece, Slide } from "./data";
import { onOpenPiece } from "./open";
import styles from "./viewer.module.scss";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Deck({
  slides,
  index,
  onIndex,
  trackRef,
  targetRef,
}: {
  slides: Slide[];
  index: number;
  onIndex: (i: number) => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
  targetRef: React.RefObject<number | null>;
}) {
  // The counter follows the track, whether it moved by swipe, key or arrow.
  // While a key or arrow scrolls it (targetRef), the counter already shows the
  // target, so the positions passed on the way are skipped.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const target = targetRef.current;
    if (target !== null) {
      if (Math.abs(track.scrollLeft - target * track.clientWidth) < 2) targetRef.current = null;
      return;
    }
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) onIndex(Math.max(0, Math.min(slides.length - 1, i)));
  };

  return (
    <div className={`${styles.print} ${styles.deck}`}>
      <div className={styles.track} ref={trackRef} onScroll={onScroll}>
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={styles.slide}
            aria-hidden={i === index ? undefined : true}
          >
            <Image
              src={slide.src}
              width={slide.w}
              height={slide.h}
              alt={slide.alt}
              sizes="(min-width: 768px) 720px, calc(100vw - 48px)"
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Viewer({ pieces }: { pieces: Piece[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const targetRef = useRef<number | null>(null);
  const [current, setCurrent] = useState<Piece | null>(null);
  const [index, setIndex] = useState(0);
  const byId = useMemo(() => new Map(pieces.map((p) => [p.id, p])), [pieces]);

  // Any print on the page opens its piece.
  useEffect(
    () =>
      onOpenPiece(({ id, trigger }) => {
        const piece = byId.get(id);
        if (!piece) return;
        triggerRef.current = trigger;
        setIndex(0);
        setCurrent(piece);
      }),
    [byId],
  );

  // Open the dialog once its content is there; the page behind stops scrolling.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !current || dialog.open) return;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    // showModal focuses the close key; a video hands focus to its player.
    if (current.kind === "video") iframeRef.current?.focus();
  }, [current]);

  // However it closes (Escape, the close key, a click on the dimmed bench),
  // the piece is unmounted (a playing video stops) and focus goes back to it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      setCurrent(null);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const slides = current?.kind === "deck" ? current.slides : [];
  const go = useCallback(
    (to: number) => {
      const track = trackRef.current;
      if (!track || !slides.length) return;
      const next = Math.max(0, Math.min(slides.length - 1, to));
      if (Math.abs(track.scrollLeft - next * track.clientWidth) >= 2) {
        targetRef.current = next;
        // A scroll that never arrives (cut short by a swipe) frees the counter.
        window.setTimeout(() => {
          if (targetRef.current === next) targetRef.current = null;
        }, 1200);
      }
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
      setIndex(next);
    },
    [slides.length],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (current?.kind !== "deck") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  // A click on the dimmed bench (not on the piece or a key) closes.
  const onClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === e.currentTarget || target.dataset.dismiss !== undefined) close();
  };

  return (
    // The click only dismisses on the backdrop; Escape (native to <dialog>)
    // and the close key do the same from the keyboard.
    <dialog
      ref={dialogRef}
      className={styles.viewer}
      aria-labelledby="viewer-title"
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      {current && (
        <div className={styles.frame} data-dismiss="">
          <div className={styles.bar} data-dismiss="">
            <p id="viewer-title" className={styles.caption}>
              <strong>{current.client}</strong>
              <span>{current.caption}</span>
            </p>
            <button type="button" className={styles.close} onClick={close} aria-label="Close">
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className={styles.stage} data-dismiss="">
            <div
              key={current.id}
              className={styles.lift}
              style={
                current.kind === "post"
                  ? ({ "--w": current.slide.w, "--h": current.slide.h } as CSSProperties)
                  : undefined
              }
            >
              {current.kind === "video" && (
                <div className={styles.phone}>
                  <div className={styles.screen}>
                    <iframe
                      ref={iframeRef}
                      src={youTubeEmbedUrl(current.videoId)}
                      title={current.title}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      onLoad={() => iframeRef.current?.focus()}
                    />
                  </div>
                </div>
              )}
              {current.kind === "post" && (
                <div className={styles.print}>
                  <Image
                    src={current.slide.src}
                    width={current.slide.w}
                    height={current.slide.h}
                    alt={current.slide.alt}
                    sizes={`(min-width: 768px) min(1040px, calc((100vh - 200px) * ${(
                      current.slide.w / current.slide.h
                    ).toFixed(3)})), calc(100vw - 48px)`}
                    loading="eager"
                  />
                </div>
              )}
              {current.kind === "deck" && (
                <Deck
                  slides={current.slides}
                  index={index}
                  onIndex={setIndex}
                  trackRef={trackRef}
                targetRef={targetRef}
                />
              )}
            </div>
          </div>
          {current.kind === "deck" && (
            <div className={styles.controls}>
              <button
                type="button"
                className={styles.key}
                onClick={() => go(index - 1)}
                disabled={index === 0}
                aria-label="Previous slide"
              >
                <FiArrowLeft aria-hidden="true" />
              </button>
              <p className={styles.count} aria-live="polite">
                <span className={styles.hidden}>Slide </span>
                {index + 1} / {current.slides.length}
              </p>
              <button
                type="button"
                className={styles.key}
                onClick={() => go(index + 1)}
                disabled={index === current.slides.length - 1}
                aria-label="Next slide"
              >
                <FiArrowRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
