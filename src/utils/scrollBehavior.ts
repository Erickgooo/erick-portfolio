/**
 * How a scripted scroll travels: a glide, or a jump for a visitor who asked
 * for less motion. A jump is "instant", not "auto": Once UI sets
 * `scroll-behavior: smooth` on <html>, and "auto" would defer to it and glide
 * the page all the same. Call it where the scroll happens, in the browser: the
 * setting can change while the page is open.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
}
