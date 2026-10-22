"use client";

// Workbench: the hero's workbench, redrawn straight and flat (sober,
// 2026-10-22): the same composition of objects, none tilted, taped or
// pinned. Objects rise into place one after another (CSS keyframes, a gentle
// settle) as the site intro lifts, then float on long offset loops that
// pause off-screen. On desktop the cluster follows the pointer a little; on
// touch, a tap brings an object forward. Only transform and opacity move.
// Only the tablet screenshot, the likely LCP element, loads with priority.
import Image from "next/image";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MEDIA } from "../media";
import styles from "./bench.module.scss";

/** Where an object lies: desktop (x, y, w) and phone (mx, my, mw), in % of the bench. */
type Place = {
  x: number;
  y: number;
  w: number;
  mx: number;
  my: number;
  mw: number;
  depth: number;
  bob: number;
};

function Slot({
  place,
  index,
  kind,
  children,
}: {
  place: Place;
  index: number;
  kind: "screen" | "print" | "tag";
  children: ReactNode;
}) {
  const style = {
    "--x": `${place.x}%`,
    "--y": `${place.y}%`,
    "--w": `${place.w}%`,
    "--mx": `${place.mx}%`,
    "--my": `${place.my}%`,
    "--mw": `${place.mw}%`,
    "--depth": place.depth,
    "--bob": `${place.bob}s`,
    "--d": index,
    zIndex: index + 1,
  } as CSSProperties;
  return (
    <div className={styles.slot} style={style} data-slot={kind}>
      <div className={styles.rise}>
        <div className={styles.par}>
          <div className={styles.bob}>
            <div className={`${styles.card} ${styles[kind]}`}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A figure on a plain tag; `lead` gives the first figure the accent. */
function Tag({ value, caption, lead = false }: { value: string; caption: string; lead?: boolean }) {
  return (
    <div className={`${styles.tagPaper} ${lead ? styles.lead : ""}`}>
      <strong className={styles.value}>{value}</strong>
      <span className={styles.caption}>{caption}</span>
    </div>
  );
}

type Piece = { src: string; w: number; h: number; alt: string };

/**
 * A print's picture. The frame holds the piece's proportions (and its alt
 * text) from the first paint; the file loads once `ready`.
 */
function PrintImage({ piece, sizes, ready }: { piece: Piece; sizes: string; ready: boolean }) {
  return (
    <span
      className={styles.frame}
      style={{ aspectRatio: `${piece.w} / ${piece.h}` }}
      role="img"
      aria-label={piece.alt}
    >
      {ready && <Image src={piece.src} width={piece.w} height={piece.h} alt="" sizes={sizes} />}
    </span>
  );
}

/** How long the prints wait behind the site intro (it covers the page for 4 s). */
const PRINTS_BEHIND_INTRO_MS = 2000;

/**
 * The site intro (IntroLoader, kept exactly as it is) covers the home on a
 * first visit; the server always renders it on "/". It is found by its
 * CSS-module class, the same hook its e2e test uses.
 */
function findIntro() {
  return document.querySelector<HTMLElement>('[class*="IntroLoader_overlay"]');
}

function isLeaving(intro: HTMLElement) {
  return !intro.isConnected || /IntroLoader_leaving/.test(intro.className);
}

export function Bench() {
  const ref = useRef<HTMLDivElement>(null);
  // `hold`: the objects wait in their final place, painted (so the first paint
  // and LCP count them) but behind the intro's opaque overlay, and rise as it
  // starts to fade, so the visitor sees the load sequence instead of missing
  // it. The server renders the hold, since it always renders the intro on "/".
  const [hold, setHold] = useState(true);
  // `ready`: the three prints are not needed while the intro covers them, so
  // their files load halfway through it (or as soon as it goes), off the
  // critical path of the first paint.
  const [ready, setReady] = useState(false);

  // Before paint, so a client navigation back home (no intro) never shows the
  // objects at rest for a frame before they rise.
  useLayoutEffect(() => {
    const intro = findIntro();
    if (!intro || isLeaving(intro)) {
      setHold(false);
      setReady(true);
      return;
    }
    const timer = window.setTimeout(() => setReady(true), PRINTS_BEHIND_INTRO_MS);
    const watch = new MutationObserver(() => {
      if (!isLeaving(intro)) return;
      setHold(false);
      setReady(true);
      watch.disconnect();
    });
    watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
    if (intro.parentNode) watch.observe(intro.parentNode, { childList: true });
    return () => {
      window.clearTimeout(timer);
      watch.disconnect();
    };
  }, []);

  useEffect(() => {
    const bench = ref.current;
    if (!bench) return;

    // Loops run only while the bench is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) bench.dataset.live = "";
        else delete bench.dataset.live;
      },
      { threshold: 0 },
    );
    io.observe(bench);

    // A tap (or click) brings an object forward; tapping it again sets it down.
    const onUp = (e: PointerEvent) => {
      const slot = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]");
      if (!slot || !bench.contains(slot)) return;
      const wasFront = slot.hasAttribute("data-front");
      for (const el of bench.querySelectorAll("[data-front]")) el.removeAttribute("data-front");
      if (!wasFront) slot.setAttribute("data-front", "");
    };
    bench.addEventListener("pointerup", onUp);

    // Desktop only: the cluster leans with the pointer.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      if (!fine.matches || calm.matches || !("live" in bench.dataset)) return;
      const box = bench.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / (box.width / 1.2)));
      py = Math.max(-1, Math.min(1, (e.clientY - (box.top + box.height / 2)) / (box.height / 1.2)));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        bench.style.setProperty("--px", px.toFixed(3));
        bench.style.setProperty("--py", py.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      bench.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.bench} ref={ref} data-hold={hold ? "" : undefined}>
      <div className={styles.stage}>
        {/* 0: the bot, on a tablet */}
        <Slot
          index={0}
          kind="screen"
          place={{ x: 3, y: 17, w: 61, mx: 0, my: 16, mw: 84, depth: 0.5, bob: 5 }}
        >
          <div className={styles.glass}>
            <Image
              src={MEDIA.whatsapp.src}
              width={MEDIA.whatsapp.w}
              height={MEDIA.whatsapp.h}
              alt="LeadBot AI on WhatsApp, built for Artesa Panadería"
              sizes="(min-width: 1280px) 440px, (min-width: 720px) 470px, 84vw"
              priority
              fetchPriority="high"
            />
          </div>
        </Slot>
        {/* 1: a printed post */}
        <Slot
          index={1}
          kind="print"
          place={{ x: 68, y: 2, w: 28, mx: 65, my: 0, mw: 34, depth: 1.1, bob: 4.4 }}
        >
          <PrintImage piece={MEDIA.coqui} sizes="(min-width: 720px) 232px, 36vw" ready={ready} />
        </Slot>
        {/* 2: a campaign creative */}
        <Slot
          index={2}
          kind="print"
          place={{ x: 3, y: 65, w: 19, mx: 4, my: 64, mw: 27, depth: 0.9, bob: 4.8 }}
        >
          <PrintImage
            piece={MEDIA.panettone}
            sizes="(min-width: 720px) 180px, 30vw"
            ready={ready}
          />
        </Slot>
        {/* 3: a story-format announcement */}
        <Slot
          index={3}
          kind="print"
          place={{ x: 73, y: 36, w: 20, mx: 73, my: 45, mw: 25, depth: 1.3, bob: 4.2 }}
        >
          <PrintImage piece={MEDIA.arqui} sizes="(min-width: 720px) 152px, 27vw" ready={ready} />
        </Slot>
      </div>
      {/* 4-7: the figures, as plain tags: on the bench on desktop, a row of tags under it on phones */}
      <div className={styles.tags}>
        <Slot
          index={4}
          kind="tag"
          place={{ x: 44, y: 52, w: 27, mx: 0, my: 0, mw: 100, depth: 0.8, bob: 4.6 }}
        >
          <Tag value="85%" caption="of conversations automated by LeadBot AI" lead />
        </Slot>
        <Slot
          index={5}
          kind="tag"
          place={{ x: 30, y: 0, w: 30, mx: 0, my: 0, mw: 100, depth: 1.5, bob: 5.2 }}
        >
          <Tag value="338K+" caption="organic views at $0 ad spend" />
        </Slot>
        <Slot
          index={6}
          kind="tag"
          place={{ x: 26, y: 73, w: 26, mx: 0, my: 0, mw: 100, depth: 1.2, bob: 4.3 }}
        >
          <Tag value="3.92x" caption="ROAS on AI ad creatives" />
        </Slot>
        <Slot
          index={7}
          kind="tag"
          place={{ x: 56, y: 79, w: 27, mx: 0, my: 0, mw: 100, depth: 1, bob: 4.9 }}
        >
          <Tag value="$3.45" caption="cost per lead in technical B2B" />
        </Slot>
      </div>
    </div>
  );
}
