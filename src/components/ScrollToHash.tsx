"use client";

// A page opened at #anchor: once it has rendered, bring the anchor into view,
// smoothly unless the visitor asked for reduced motion.
import { useEffect } from "react";

export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, []);

  return null;
}
