"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { pickShared, shouldIntercept, vtNameForPath } from "./viewTransition";

const TIMEOUT_MS = 500;

type Pending = { pathname: string; resolve: () => void };

/**
 * Global click listener (capture phase) that wraps internal navigations in
 * document.startViewTransition. Chosen over Next's experimental viewTransition
 * flag, which switches the whole app to React's experimental channel (spec 6.4).
 *
 * - Resolves when the new pathname has rendered (effect on usePathname), with a
 *   500 ms safety timeout that also skips the animation.
 * - Back/forward (popstate) is left alone on purpose: Next handles it in its own
 *   startTransition, and iOS already animates the swipe-back gesture.
 * - Only the clicked element gets a view-transition-name, cleared when done.
 */
export function ViewTransitions() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<Pending | null>(null);
  const latest = useRef(0);

  useEffect(() => {
    const p = pending.current;
    if (p && p.pathname === pathname) {
      pending.current = null;
      p.resolve();
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;

    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const decision = shouldIntercept({
        button: event.button,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        defaultPrevented: event.defaultPrevented,
        href: anchor.getAttribute("href"),
        target: anchor.getAttribute("target"),
        download: anchor.hasAttribute("download"),
        current: {
          origin: location.origin,
          pathname: location.pathname,
          search: location.search,
        },
      });
      if (!decision) return;
      event.preventDefault();

      const name = vtNameForPath(decision.pathname);
      const shared = name ? pickShared(name) : null;
      if (shared && name) shared.style.viewTransitionName = name;
      document.documentElement.classList.add("vt-active");

      const id = ++latest.current;

      let timer = 0;
      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            // The update callback runs asynchronously, so a second click before
            // the first navigation lands (double click, slow route) can reach
            // here while an earlier entry is still pending: settle that one
            // rather than strand it.
            pending.current?.resolve();
            const entry: Pending = { pathname: decision.pathname, resolve };
            pending.current = entry;
            router.push(decision.href);
            timer = window.setTimeout(() => {
              if (pending.current === entry) {
                pending.current = null;
                transition.skipTransition();
              }
              resolve(); // idempotent; guarantees this callback always settles
            }, TIMEOUT_MS);
          }),
      );
      // Skipping rejects `ready`; that is expected, not an error.
      transition.ready.catch(() => {});
      transition.finished
        .catch(() => {})
        .finally(() => {
          window.clearTimeout(timer);
          if (shared) shared.style.viewTransitionName = "";
          if (id === latest.current) document.documentElement.classList.remove("vt-active");
        });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
