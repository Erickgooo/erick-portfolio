"use client";

// Workbench scenes: drives a SceneStepper. From 1024 px it maps the scroll
// position through the pinned track to the active step (data-active on the
// stepper, data-on on that step's layer) and the progress inside the step
// (--p, for the growing line). Below that every layer is on: the scenes stack
// and each one starts as it comes into view.
import { useEffect, useRef } from "react";

const DESK = "(min-width: 1024px)";

export function StepperController({ count }: { count: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stepper = ref.current?.closest<HTMLElement>("[data-stepper]");
    const track = stepper?.querySelector<HTMLElement>("[data-track]");
    if (!stepper || !track) return;
    const layers = Array.from(stepper.querySelectorAll<HTMLElement>("[data-scene-layer]"));
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
          stepper.dataset.active = "stack";
          stepper.style.removeProperty("--p");
          light("all");
          last = "stack";
        }
        return;
      }
      const box = track.getBoundingClientRect();
      const travel = Math.max(1, box.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -box.top / travel)) * count;
      const active = Math.min(count - 1, Math.floor(progress));
      stepper.style.setProperty("--p", Math.min(1, progress - active).toFixed(3));
      const next = String(active);
      if (next !== last) {
        stepper.dataset.active = next;
        light(active);
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
  }, [count]);

  return <span ref={ref} hidden />;
}
