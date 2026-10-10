import { type ReactNode, isValidElement } from "react";

/**
 * What goes inside a fenced block that has no language. MDX hands `pre` one
 * child, its `code` element, which this site maps to an inline-code chip set
 * smaller than the minimum text size. The chip's own children are taken out of
 * it, whatever they are: a string, or elements when the block holds markup.
 * Anything that is not a single element with children is returned as it is.
 */
export function preContent(children: ReactNode): ReactNode {
  if (!isValidElement<{ children?: ReactNode }>(children)) return children;
  return children.props.children ?? children;
}
