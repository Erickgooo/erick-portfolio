"use client";

// Workbench scenes: the one client island that plays every <Scene> on a page.
// Mount it once per page that has scenes, next to RevealObserver.
//
// For each [data-scene] it waits for the start trigger (start.ts), then walks
// the steps: at step k the scene carries data-step="k" and data-s0 ... data-sk,
// which its CSS reads (see _scene.scss). Typed text and counting figures start
// at their own step. Timers run only while the scene is live (on screen, tab
// visible, stepper layer on); `data-live` marks that for CSS loops. With
// reduced motion every scene is set to its last step, with its text and
// figures complete, and nothing runs.
import { useEffect } from "react";
import { TYPE_MS, prefersReducedMotion, watchScene } from "./start";

/** Typing rhythm (foundable.com, measured): hold a phrase, delete, pause, next. */
const HOLD_MS = 1700;
const DELETE_MS = 26;
const GAP_MS = 380;

type Part = {
  at: number;
  start: () => void;
  reset: () => void;
  finish: () => void;
  setLive: (live: boolean) => void;
};

function typer(el: HTMLElement): Part | null {
  const out = el.querySelector<HTMLElement>("[data-typed-text]");
  let phrases: string[] = [];
  try {
    phrases = JSON.parse(el.dataset.type ?? "[]");
  } catch {
    phrases = [];
  }
  if (!out || phrases.length === 0) return null;
  const cycle = el.hasAttribute("data-cycle");
  const speed = Number(el.dataset.speed) || TYPE_MS;
  let i = 0;
  let n = 0;
  let phase: "idle" | "type" | "hold" | "delete" | "gap" | "done" = "idle";
  let timer = 0;
  let live = false;

  const show = () => {
    out.textContent = phrases[i].slice(0, n);
  };
  const later = (ms: number) => {
    timer = window.setTimeout(tick, ms);
  };
  // A little unevenness, as hands type.
  const pace = () => speed * (0.7 + Math.random() * 0.6);

  function tick() {
    timer = 0;
    if (!live) return;
    if (phase === "type") {
      if (n < phrases[i].length) {
        n += 1;
        show();
        later(pace());
      } else if (cycle) {
        phase = "hold";
        later(HOLD_MS);
      } else {
        phase = "done";
        el.removeAttribute("data-typing");
        el.dataset.typed = "";
      }
    } else if (phase === "hold") {
      phase = "delete";
      later(DELETE_MS);
    } else if (phase === "delete") {
      if (n > 0) {
        n -= 1;
        show();
        later(DELETE_MS);
      } else {
        phase = "gap";
        later(GAP_MS);
      }
    } else if (phase === "gap") {
      i = (i + 1) % phrases.length;
      phase = "type";
      later(pace());
    }
  }

  const stop = () => {
    if (timer) window.clearTimeout(timer);
    timer = 0;
  };

  return {
    at: Number(el.dataset.at) || 0,
    start() {
      stop();
      i = 0;
      n = 0;
      phase = "type";
      show();
      el.dataset.typing = "";
      el.removeAttribute("data-typed");
      if (live) later(speed);
    },
    reset() {
      stop();
      phase = "idle";
      i = 0;
      n = 0;
      out.textContent = "";
      el.removeAttribute("data-typing");
      el.removeAttribute("data-typed");
    },
    finish() {
      stop();
      phase = "done";
      out.textContent = phrases[0];
      el.removeAttribute("data-typing");
      el.dataset.typed = "";
    },
    setLive(next) {
      live = next;
      if (!live) stop();
      else if (!timer && phase !== "idle" && phase !== "done") later(speed);
    },
  };
}

function counter(el: HTMLElement): Part | null {
  const out = el.querySelector<HTMLElement>("[data-count-text]");
  const value = el.dataset.count ?? "";
  const match = value.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!out || !match) return null;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  const decimals = digits.split(".")[1]?.length ?? 0;
  const grouped = digits.includes(",");
  const duration = Number(el.dataset.duration) || 1400;
  let frame = 0;

  const format = (v: number) => {
    const fixed = v.toFixed(decimals);
    if (!grouped) return fixed;
    const [whole, part] = fixed.split(".");
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return part ? `${withCommas}.${part}` : withCommas;
  };
  const write = (v: number) => {
    out.textContent = `${prefix}${format(v)}${suffix}`;
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  return {
    at: Number(el.dataset.at) || 0,
    start() {
      stop();
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        // Ease-out: quick at first, settling on the real figure.
        write(target * (1 - (1 - p) ** 3));
        frame = p < 1 ? requestAnimationFrame(step) : 0;
        if (p >= 1) out.textContent = value;
      };
      frame = requestAnimationFrame(step);
    },
    reset() {
      stop();
      write(0);
    },
    finish() {
      stop();
      out.textContent = value;
    },
    setLive() {},
  };
}

function setStep(root: HTMLElement, step: number, total: number) {
  for (let k = 0; k < total; k++) {
    if (k <= step) root.setAttribute(`data-s${k}`, "");
    else root.removeAttribute(`data-s${k}`);
  }
  if (step < 0) root.removeAttribute("data-step");
  else root.dataset.step = String(step);
}

function drive(root: HTMLElement, reduced: boolean): () => void {
  const steps = (root.dataset.steps ?? "0").split(",").map((s) => Number(s) || 0);
  const total = steps.length;
  const last = total - 1;
  const loop = root.hasAttribute("data-loop");
  const parts = [
    ...Array.from(root.querySelectorAll<HTMLElement>("[data-type]"), typer),
    ...Array.from(root.querySelectorAll<HTMLElement>("[data-count]"), counter),
  ].filter((p): p is Part => p !== null);

  if (reduced) {
    root.dataset.started = "";
    setStep(root, last, total);
    for (const p of parts) p.finish();
    return () => {};
  }

  for (const p of parts) p.reset();
  let step = -1;
  let timer = 0;
  let live = false;
  let clearing = false;

  const enter = (k: number) => {
    step = k;
    setStep(root, k, total);
    for (const p of parts) if (p.at === k) p.start();
  };

  const stop = () => {
    if (timer) window.clearTimeout(timer);
    timer = 0;
  };

  // Back to before step 0 with transitions off, then play from step 0.
  const replay = () => {
    stop();
    clearing = false;
    root.dataset.resetting = "";
    setStep(root, -1, total);
    for (const p of parts) p.reset();
    void root.offsetWidth;
    root.removeAttribute("data-resetting");
    root.removeAttribute("data-clearing");
    enter(0);
    schedule();
  };

  function advance() {
    timer = 0;
    if (step < last) {
      enter(step + 1);
      schedule();
    } else if (loop) {
      clearing = true;
      root.dataset.clearing = "";
      timer = window.setTimeout(replay, 500);
    }
  }

  function schedule() {
    stop();
    if (!live) return;
    if (clearing) {
      timer = window.setTimeout(replay, 500);
      return;
    }
    if (step >= last && !loop) return;
    timer = window.setTimeout(advance, steps[step] ?? 0);
  }

  let wasLayerOn = true;
  const unwatch = watchScene(
    root,
    {
      afterIntro: root.hasAttribute("data-after-intro"),
      threshold: Number(root.dataset.threshold) || undefined,
    },
    ({ started, live: nowLive, layerOn }) => {
      live = nowLive;
      if (live) root.dataset.live = "";
      else root.removeAttribute("data-live");
      for (const p of parts) p.setLive(live);
      if (started && !root.hasAttribute("data-started")) {
        root.dataset.started = "";
        enter(0);
      } else if (started && layerOn && !wasLayerOn) {
        // A stepper layer became active again: play the scene from the top.
        wasLayerOn = layerOn;
        replay();
        return;
      }
      wasLayerOn = layerOn;
      if (live) schedule();
      else stop();
    },
  );

  return () => {
    unwatch();
    stop();
    for (const p of parts) p.reset();
  };
}

export function SceneDriver() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const stops = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"), (root) =>
      drive(root, reduced),
    );
    return () => {
      for (const stop of stops) stop();
    };
  }, []);

  return null;
}
