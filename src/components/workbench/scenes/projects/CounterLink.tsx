"use client";

// The figure counter's pointer shortcut: a click or tap opens the case whose
// figure is showing. The scene driver moves the href with the figure, so the
// click reads it from the element instead of a prop, and navigates on the
// client like a Next link. Out of the tab order inside an aria-hidden scene:
// keyboard and screen reader users have the same figure and link on the card.
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

export function CounterLink({
  hrefs,
  className,
  children,
}: {
  hrefs: string[];
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = e.currentTarget.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    router.push(href);
  };
  return (
    <a
      href={hrefs[0]}
      className={className}
      tabIndex={-1}
      data-phrase-href={JSON.stringify(hrefs)}
      data-pause-hover=""
      onClick={open}
    >
      {children}
    </a>
  );
}
