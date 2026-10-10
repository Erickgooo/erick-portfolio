"use client";

import { useEffect } from "react";

const ONCE = "[data-reveal]:not(.is-in), [data-mo-io]:not(.is-in)";
const BAND = "[data-mo-band]";

/**
 * IntersectionObserver fallback for browsers without scroll-driven animations.
 * Inert unless the head script set html.mo-io. Watches nodes added by client
 * navigations too (MutationObserver), then flags html.mo-ready so the head
 * script's 3 s watchdog doesn't strip the fallback.
 */
export function MotionRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("mo-io")) return;

    const once = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            once.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const band = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-active", entry.isIntersecting);
          if (entry.isIntersecting) entry.target.classList.add("was-active");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    const scan = (scope: ParentNode) => {
      for (const el of scope.querySelectorAll(ONCE)) once.observe(el);
      for (const el of scope.querySelectorAll(BAND)) band.observe(el);
    };
    scan(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(ONCE)) once.observe(node);
          if (node.matches(BAND)) band.observe(node);
          scan(node);
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    root.classList.add("mo-ready");

    return () => {
      once.disconnect();
      band.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
