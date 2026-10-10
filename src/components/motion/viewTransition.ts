export interface InterceptInput {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  href: string | null;
  target: string | null;
  download: boolean;
  current: { origin: string; pathname: string; search: string };
}

/** Which clicks become a view-transition navigation. Anything unusual falls through to the browser/Next. */
export function shouldIntercept(i: InterceptInput): { href: string; pathname: string } | null {
  if (i.defaultPrevented || i.button !== 0) return null;
  if (i.metaKey || i.ctrlKey || i.shiftKey || i.altKey) return null;
  if (!i.href || i.download) return null;
  if (i.target && i.target !== "_self") return null;

  let url: URL;
  try {
    url = new URL(i.href, i.current.origin + i.current.pathname);
  } catch {
    return null;
  }
  if (url.origin !== i.current.origin) return null;
  if (url.pathname.startsWith("/api/")) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null; // files (pdf, xml, …)
  if (url.pathname === i.current.pathname && url.search === i.current.search) return null; // same page / hash

  return { href: url.pathname + url.search + url.hash, pathname: url.pathname };
}

/** Case-study routes morph from the clicked project image; everything else just crossfades. */
export function vtNameForPath(pathname: string): string | null {
  const m = pathname.match(/^\/work\/([^/]+)\/?$/);
  return m ? `project-${m[1]}` : null;
}

/** First *visible* element carrying data-vt-name=<name> (hidden candidates can't be captured). */
export function pickShared(name: string, root: ParentNode = document): HTMLElement | null {
  const candidates = root.querySelectorAll<HTMLElement>(`[data-vt-name="${CSS.escape(name)}"]`);
  for (const el of candidates) {
    const visible =
      typeof el.checkVisibility === "function"
        ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
        : el.getClientRects().length > 0;
    if (visible) return el;
  }
  return null;
}
