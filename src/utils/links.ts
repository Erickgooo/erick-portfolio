/**
 * What a link that leaves the site carries: a tab of its own, so the portfolio
 * stays open behind it, and no handle on the page it came from.
 */
export const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * The attributes for a link whose address is only known at run time: a new tab
 * for an http(s) address, nothing for a path, an anchor or a `mailto:`.
 */
export function newTabIfExternal(href: string): typeof NEW_TAB | Record<string, never> {
  return /^https?:\/\//i.test(href) ? NEW_TAB : {};
}
