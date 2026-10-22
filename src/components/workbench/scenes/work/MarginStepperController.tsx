"use client";

// Drives a MarginStepper. From 1024 px the active step is the last of its
// anchors (parts of the case's text) whose top has passed the activation line
// (42 % of the screen's height); that step's layer gets data-on and the
// others lose it. Below 1024 px every layer is on: the sheets stack and each
// scene starts as it comes into view.
import { useEffect, useRef } from "react";

const DESK = "(min-width: 1024px)";
const LINE = 0.42;

type Anchor = { sel: string; text: string };

export function MarginStepperController() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-margin-stepper]");
    if (!root) return;
    const section = root.closest<HTMLElement>("section") ?? document.body;
    let specs: Anchor[] = [];
    try {
      specs = JSON.parse(root.dataset.anchors ?? "[]");
    } catch {
      specs = [];
    }
    const anchors = specs.map(
      ({ sel, text }) =>
        Array.from(section.querySelectorAll<HTMLElement>(sel)).find((el) =>
          (el.textContent ?? "").includes(text),
        ) ?? null,
    );
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-scene-layer]"));
    const desk = window.matchMedia(DESK);
    let frame = 0;
    let last = "";

    const light = (active: number | "all") => {
      for (const [i, layer] of layers.entries()) {
        if (active === "all" || i === active) layer.setAttribute("data-on", "");
        else layer.removeAttribute("data-on");
      }
    };

    const update = () => {
      frame = 0;
      if (!desk.matches) {
        if (last !== "stack") {
          root.dataset.active = "stack";
          light("all");
          last = "stack";
        }
        return;
      }
      const line = window.innerHeight * LINE;
      let active = 0;
      for (const [i, el] of anchors.entries()) {
        if (el && el.getBoundingClientRect().top < line) active = i;
      }
      const next = String(Math.min(active, layers.length - 1));
      if (next !== last) {
        root.dataset.active = next;
        light(Number(next));
        last = next;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desk.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desk.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <span ref={ref} hidden />;
}
