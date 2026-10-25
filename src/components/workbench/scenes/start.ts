// Workbench scenes: the start trigger, shared by SceneDriver and CanvasLoop.
//
// A scene starts once, when all of these hold:
//   1. it is in view (`threshold` of it on screen);
//   2. if it is a hero scene (`afterIntro`), the site intro has started to
//      fade, so nothing moves behind it (the same hold the bench uses);
//   3. if it sits in a stepper layer (`[data-scene-layer]`), that layer is
//      the active one (`data-on`);
//   4. it leads (below).
// After that it is "live" only while it is on screen, the tab is visible, its
// layer (if any) is on and it leads: loops and timers run only while live.
//
// One scene moves at a time (pulido de animaciones, 2026-10-25). Of the
// scenes on screen, the one nearest the middle of the screen leads; the
// others wait to start, or hold where they are, until they lead. On phones,
// where a stepper's sheets stack, the end of one scene and the start of the
// next used to play together. A canvas inside a scene follows its scene.
//
// Everything here is plain DOM (no React), so a server-rendered scene needs
// no hydration: SceneDriver finds it by its attributes.

type Contender = {
  el: HTMLElement;
  /** On screen, its layer on, released and the tab visible. */
  ready: () => boolean;
  /** Re-evaluates the scene's state after the lead changes. */
  refresh: () => void;
};

const contenders = new Set<Contender>();
let lead: Contender | null = null;
let electing = 0;
/** How much nearer the middle (a share of the screen's height) a scene must be to take the lead. */
const HOLD = 0.12;

function offCentre(c: Contender) {
  const box = c.el.getBoundingClientRect();
  return Math.abs((box.top + box.bottom) / 2 - window.innerHeight / 2);
}

function elect() {
  electing = 0;
  let best: Contender | null = null;
  let bestOff = Number.POSITIVE_INFINITY;
  for (const c of contenders) {
    if (!c.ready()) continue;
    const off = offCentre(c);
    if (off < bestOff) {
      best = c;
      bestOff = off;
    }
  }
  // The lead only changes hands for a clear difference, so two scenes at
  // about the same distance do not take turns.
  if (
    lead &&
    best &&
    best !== lead &&
    lead.ready() &&
    offCentre(lead) - bestOff < window.innerHeight * HOLD
  ) {
    best = lead;
  }
  if (best === lead) return;
  const was = lead;
  lead = best;
  was?.refresh();
  lead?.refresh();
}

function requestElection() {
  if (!electing) electing = requestAnimationFrame(elect);
}

function listen(on: boolean) {
  if (on) {
    window.addEventListener("scroll", requestElection, { passive: true });
    window.addEventListener("resize", requestElection);
  } else {
    window.removeEventListener("scroll", requestElection);
    window.removeEventListener("resize", requestElection);
  }
}

/** The site intro overlay (IntroLoader, kept as it is), found by its CSS-module class like Bench does. */
export function findIntro(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[class*="IntroLoader_overlay"]');
}

function introLeaving(intro: HTMLElement) {
  return !intro.isConnected || /IntroLoader_leaving/.test(intro.className);
}

/**
 * Calls `release` once the intro starts to fade (or, with `gone`, once it has
 * faded and left the page), or at once when there is no intro (any page but a
 * first visit to "/"). Returns a cleanup.
 */
export function whenIntroLeaves(
  release: () => void,
  { gone = false }: { gone?: boolean } = {},
): () => void {
  const intro = findIntro();
  const over = (el: HTMLElement) => (gone ? !el.isConnected : introLeaving(el));
  if (!intro || over(intro)) {
    release();
    return () => {};
  }
  const watch = new MutationObserver(() => {
    if (!over(intro)) return;
    watch.disconnect();
    release();
  });
  watch.observe(intro, { attributes: true, attributeFilter: ["class"] });
  if (intro.parentNode) watch.observe(intro.parentNode, { childList: true });
  return () => watch.disconnect();
}

/** Typing pace, measured on foundable.com: about 47 ms a character. */
export const TYPE_MS = 47;

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type StartOptions = {
  /** Wait for the site intro to start fading (hero scenes). */
  afterIntro?: boolean;
  /** Share of the scene that must be on screen to start it. */
  threshold?: number;
};

export type SceneState = {
  started: boolean;
  live: boolean;
  /** False while the scene's stepper layer is not the active one. */
  layerOn: boolean;
};

/**
 * Watches one scene element and reports its state: `started` latches once
 * (see the rules above); `live` follows screen, tab and layer. `onChange` is
 * called whenever `started` or `live` changes, and whenever the layer turns
 * on or off. Returns a cleanup.
 */
export function watchScene(
  el: HTMLElement,
  { afterIntro = false, threshold = 0.3 }: StartOptions,
  onChange: (state: SceneState) => void,
): () => void {
  const layer = el.closest<HTMLElement>("[data-scene-layer]");
  let seen = false;
  let onScreen = false;
  let released = !afterIntro;
  let layerOn = layer ? layer.hasAttribute("data-on") : true;
  let visible = !document.hidden;
  let started = false;
  let live = false;

  // A canvas inside a scene follows its scene; every other scene contends.
  const contends = !el.parentElement?.closest("[data-scene]");
  const self: Contender = {
    el,
    ready: () => onScreen && layerOn && released && visible,
    refresh: () => update(),
  };
  const leads = () => !contends || lead === self;

  function update(layerChanged = false) {
    const was = { started, live };
    if (!started && seen && released && layerOn && leads()) started = true;
    live = started && onScreen && visible && layerOn && leads();
    if (layerChanged || started !== was.started || live !== was.live) {
      onChange({ started, live, layerOn });
    }
  }

  // Something that decides the lead changed: elect (next frame), then update.
  const changed = (layerChanged = false) => {
    if (contends) requestElection();
    update(layerChanged);
  };

  if (contends) {
    if (contenders.size === 0) listen(true);
    contenders.add(self);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onScreen = entry.isIntersecting;
        if (entry.intersectionRatio >= threshold) seen = true;
      }
      changed();
    },
    { threshold: [0, threshold] },
  );
  io.observe(el);

  const onVisibility = () => {
    visible = !document.hidden;
    changed();
  };
  document.addEventListener("visibilitychange", onVisibility);

  let layerWatch: MutationObserver | undefined;
  if (layer) {
    layerWatch = new MutationObserver(() => {
      const next = layer.hasAttribute("data-on");
      if (next === layerOn) return;
      layerOn = next;
      changed(true);
    });
    layerWatch.observe(layer, { attributes: true, attributeFilter: ["data-on"] });
  }

  const stopIntro = afterIntro
    ? whenIntroLeaves(() => {
        released = true;
        changed();
      })
    : undefined;

  return () => {
    io.disconnect();
    layerWatch?.disconnect();
    stopIntro?.();
    document.removeEventListener("visibilitychange", onVisibility);
    if (contends) {
      contenders.delete(self);
      if (lead === self) {
        lead = null;
        requestElection();
      }
      if (contenders.size === 0) listen(false);
    }
  };
}
