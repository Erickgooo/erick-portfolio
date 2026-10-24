"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ScrollToHash() {
  const router = useRouter();

  useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the '#' symbol
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        // With reduced motion the page lands on the anchor at once.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        element.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    }
  }, [router]);

  return null;
}
