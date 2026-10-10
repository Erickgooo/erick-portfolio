import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  /** Entry direction on the 0°/90° grid. */
  direction?: "up" | "left";
  /** Stagger slot: shifts the view() range by 4% (or the IO fallback by 60 ms) per step. */
  index?: number;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Scroll-driven entry (server component, no JS). Uses `animation-timeline: view()`;
 * browsers without it get the MotionRuntime IntersectionObserver fallback. Content
 * is visible without JS: the hidden state only exists under html.mo-io.
 */
export function Reveal({
  as: Tag = "div",
  direction = "up",
  index = 0,
  id,
  className,
  style,
  children,
}: RevealProps) {
  return (
    <Tag
      id={id}
      data-reveal={direction === "left" ? "left" : ""}
      className={className}
      style={{ "--i": index, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
