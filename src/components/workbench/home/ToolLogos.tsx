"use client";

// Workbench: loads the tool logos (ToolSprite) when the tool wall comes within
// a screen of the viewport. The wall sits well below the fold, and its logo
// paths are the heaviest markup of the home; inlined they cost about 12 KB of
// compressed HTML (the paths travel twice, as HTML and in the RSC payload) on
// the critical path of the first paint. Until they arrive each tile keeps the
// logo's space and shows its name, so nothing shifts when they land.
import { type ComponentType, useEffect, useRef, useState } from "react";

export function ToolLogos() {
  const ref = useRef<HTMLSpanElement>(null);
  const [Sprite, setSprite] = useState<ComponentType | null>(null);

  useEffect(() => {
    const wall = ref.current?.closest("section");
    if (!wall) return;
    let cancelled = false;
    const load = () => {
      import("./ToolSprite").then((m) => {
        if (!cancelled) setSprite(() => m.ToolSprite);
      });
    };
    if (!("IntersectionObserver" in window)) {
      load();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        load();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(wall);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  return Sprite ? <Sprite /> : <span ref={ref} hidden />;
}
