"use client";

// Workbench, 404: the bench with an empty spot (sober, 2026-10-22). Straight
// objects drawn with a hairline; where a print should be, a dashed outline.
// The objects rise into place on load (CSS), then drift on long offset loops
// that run only while the bench is on screen, like the home's. Decorative:
// hidden from assistive technology.
import { type CSSProperties, useEffect, useRef } from "react";
import styles from "./notfound.module.scss";

type Place = { x: number; y: number; w: number; bob: number; kind: string };

// The empty spot stays clear in the middle; the other objects sit around it.
const OBJECTS: Place[] = [
  { x: 3, y: 38, w: 26, bob: 4.8, kind: "sheet" },
  { x: 72, y: 3, w: 22, bob: 5.2, kind: "square" },
  { x: 35, y: 12, w: 31, bob: 4.4, kind: "empty" },
  { x: 70, y: 50, w: 26, bob: 4.6, kind: "print" },
  { x: 37, y: 80, w: 24, bob: 5, kind: "tag" },
];

export function EmptySpot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bench = ref.current;
    if (!bench || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) bench.dataset.live = "";
      else delete bench.dataset.live;
    });
    io.observe(bench);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.bench} ref={ref} aria-hidden="true">
      {OBJECTS.map((o, i) => (
        <span
          key={o.kind}
          className={styles.slot}
          style={
            {
              "--x": `${o.x}%`,
              "--y": `${o.y}%`,
              "--w": `${o.w}%`,
              "--bob": `${o.bob}s`,
              "--d": i,
            } as CSSProperties
          }
        >
          <span className={styles.rise}>
            <span className={styles.bob}>
              <span className={`${styles.object} ${styles[o.kind]}`}>
                {o.kind === "sheet" && <span className={styles.stroke} />}
                {o.kind === "print" && <span className={styles.blank} />}
              </span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
