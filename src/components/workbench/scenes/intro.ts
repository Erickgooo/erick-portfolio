// The site intro, as the rest of the page sees it: whatever must wait for the
// intro (the scenes, the pointer glow, the chatbot's greeting) asks here. Kept
// apart from start.ts so the layout's islands load only this.

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
