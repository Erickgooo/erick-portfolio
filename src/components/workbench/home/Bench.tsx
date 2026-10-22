"use client";

// Workbench: the hero's workbench. Objects rise into place one after another
// (CSS keyframes, overshoot) as the site intro lifts, then bob on long offset
// loops that pause off-screen. On desktop the cluster leans with the pointer;
// on touch, a tap brings an object forward. Only transform and opacity move.
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

type Place = {
  x: number;
  y: number;
  w: number;
  r: number;
  mx: number;
  my: number;
  mw: number;
  mr: number;
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
    "--r": `${place.r}deg`,
    "--mx": `${place.mx}%`,
    "--my": `${place.my}%`,
    "--mw": `${place.mw}%`,
    "--mr": `${place.mr}deg`,
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

function Tag({
  value,
  caption,
  paper,
}: {
  value: string;
  caption: string;
  paper: "sun" | "tomato" | "cobalt" | "mint";
}) {
  return (
    <div className={`${styles.tagPaper} ${styles[paper]}`}>
      <span className={styles.hole} aria-hidden="true" />
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
          place={{ x: 6, y: 17, w: 64, r: -3, mx: 2, my: 15, mw: 84, mr: -3, depth: 0.5, bob: 5 }}
        >
          <div className={styles.glass}>
            <Image
              src={MEDIA.whatsapp.src}
              width={MEDIA.whatsapp.w}
              height={MEDIA.whatsapp.h}
              alt="LeadBot AI on WhatsApp, built for Artesa Panadería"
              sizes="(min-width: 720px) 420px, 84vw"
              priority
              fetchPriority="high"
            />
          </div>
        </Slot>
        {/* 1: a printed post */}
        <Slot
          index={1}
          kind="print"
          place={{ x: 63, y: 3, w: 32, r: 7, mx: 62, my: 0, mw: 35, mr: 7, depth: 1.1, bob: 4.4 }}
        >
          <span className={`${styles.tape} ${styles.tapeSun}`} aria-hidden="true" />
          <PrintImage piece={MEDIA.coqui} sizes="(min-width: 720px) 232px, 36vw" ready={ready} />
        </Slot>
        {/* 2: a campaign creative */}
        <Slot
          index={2}
          kind="print"
          place={{ x: 1, y: 55, w: 25, r: -8, mx: 0, my: 57, mw: 29, mr: -7, depth: 0.9, bob: 4.8 }}
        >
          <span className={styles.clip} aria-hidden="true" />
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
          place={{ x: 75, y: 41, w: 21, r: 5, mx: 70, my: 46, mw: 26, mr: 6, depth: 1.3, bob: 4.2 }}
        >
          <span className={styles.pin} aria-hidden="true" />
          <PrintImage piece={MEDIA.arqui} sizes="(min-width: 720px) 152px, 27vw" ready={ready} />
        </Slot>
      </div>
      {/* 4-7: the figures, as paper tags: on the bench on desktop, a row of tags under it on phones */}
      <div className={styles.tags}>
        <Slot
          index={4}
          kind="tag"
          place={{ x: 46, y: 53, w: 29, r: 4, mx: 0, my: 0, mw: 100, mr: -2, depth: 0.8, bob: 4.6 }}
        >
          <Tag value="85%" caption="of conversations automated by LeadBot AI" paper="cobalt" />
        </Slot>
        <Slot
          index={5}
          kind="tag"
          place={{ x: 29, y: 2, w: 30, r: -5, mx: 0, my: 0, mw: 100, mr: 2, depth: 1.5, bob: 5.2 }}
        >
          <Tag value="338K+" caption="organic views at $0 ad spend" paper="sun" />
        </Slot>
        <Slot
          index={6}
          kind="tag"
          place={{
            x: 25,
            y: 74,
            w: 26,
            r: 3,
            mx: 0,
            my: 0,
            mw: 100,
            mr: 1.5,
            depth: 1.2,
            bob: 4.3,
          }}
        >
          <Tag value="3.92x" caption="ROAS on AI ad creatives" paper="tomato" />
        </Slot>
        <Slot
          index={7}
          kind="tag"
          place={{
            x: 52,
            y: 79,
            w: 27,
            r: -4,
            mx: 0,
            my: 0,
            mw: 100,
            mr: -2.5,
            depth: 1,
            bob: 4.9,
          }}
        >
          <Tag value="$3.45" caption="cost per lead in technical B2B" paper="mint" />
        </Slot>
      </div>
    </div>
  );
}
