// Workbench scenes: the start trigger, shared by SceneDriver and CanvasLoop.
//
// A scene starts once, when all of these hold:
//   1. it is in view (`threshold` of it on screen);
//   2. if it is a hero scene (`afterIntro`), the site intro has started to
//      fade, so nothing moves behind it (the same hold the bench uses);
//   3. if it sits in a stepper layer (`[data-scene-layer]`), that layer is
//      the active one (`data-on`).
// After that it is "live" only while it is on screen, the tab is visible and
// its layer (if any) is on: loops and timers run only while live.
//
// Everything here is plain DOM (no React), so a server-rendered scene needs
// no hydration: SceneDriver finds it by its attributes.

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

  const update = (layerChanged = false) => {
    const was = { started, live };
    if (!started && seen && released && layerOn) started = true;
    live = started && onScreen && visible && layerOn;
    if (layerChanged || started !== was.started || live !== was.live) {
      onChange({ started, live, layerOn });
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onScreen = entry.isIntersecting;
        if (entry.intersectionRatio >= threshold) seen = true;
      }
      update();
    },
    { threshold: [0, threshold] },
  );
  io.observe(el);

  const onVisibility = () => {
    visible = !document.hidden;
    update();
  };
  document.addEventListener("visibilitychange", onVisibility);

  let layerWatch: MutationObserver | undefined;
  if (layer) {
    layerWatch = new MutationObserver(() => {
      const next = layer.hasAttribute("data-on");
      if (next === layerOn) return;
      layerOn = next;
      update(true);
    });
    layerWatch.observe(layer, { attributes: true, attributeFilter: ["data-on"] });
  }

  const stopIntro = afterIntro
    ? whenIntroLeaves(() => {
        released = true;
        update();
      })
    : undefined;

  return () => {
    io.disconnect();
    layerWatch?.disconnect();
    stopIntro?.();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
