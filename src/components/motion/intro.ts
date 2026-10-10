/** Resolves once html.intro-pending is gone (immediately if it never was). */
export function whenIntroDone(): Promise<void> {
  const root = document.documentElement;
  if (!root.classList.contains("intro-pending")) return Promise.resolve();
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!root.classList.contains("intro-pending")) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  });
}
