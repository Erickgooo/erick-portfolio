// Incentiva Group's medal, the brand's symbol, for the scenes that show it.
// It is the official mark, not a redrawing: the two paths (the ribbon and the
// disc), their transforms and the viewBox are copied unchanged from the brand
// files public/images/projects/incentiva-brand/incentiva_medalla_m2-navy-amarillo.svg
// and incentiva_medalla_m1-azul-cian.svg (same paths, two official
// colourways), which come from the website theme's assets/brand. Only the
// full-canvas clip of the export is left out, which changes no pixel.
//
// Each path is drawn in its own SVG with the full viewBox, and the two SVGs
// lie exactly over each other, so together they are the mark; a scene moves
// the pieces apart by moving the SVGs (CSS lengths on an element inside an SVG
// would be read in viewBox units). The fills are the colourways' (navy and
// yellow, or blue and cyan), set by the scene's CSS.
import styles from "./incentivamedal.module.scss";

const MEDAL_VIEWBOX = "0 0 329.604 601.274";

export function IncentivaMedal({
  className,
  ribbonClass,
  discClass,
}: {
  className?: string;
  ribbonClass?: string;
  discClass?: string;
}) {
  const join = (...names: (string | undefined)[]) => names.filter(Boolean).join(" ");
  return (
    <span className={join(styles.medal, className)} aria-hidden="true">
      <svg
        className={join(styles.piece, styles.ribbon, ribbonClass)}
        viewBox={MEDAL_VIEWBOX}
        focusable="false"
        aria-hidden="true"
      >
        <path
          transform="matrix(1,0,0,-1,107.6036,298.004)"
          d="M0 0-103.71 231.564C-106.306 237.399-107.604 243.556-107.604 250.363-107.604 276.616-86.209 298.004-59.959 298.004-39.54 298.004-22.531 285.202-15.395 267.54L64.492 77.947 133.202 266.407C139.356 284.717 156.21 298.004 176.629 298.004 201.582 298.004 222.001 277.588 222.001 252.471 222.001 246.637 221.026 240.963 218.92 235.778L123.315 1.947C113.267-22.686 89.445-40.509 61.251-40.509 33.702-40.509 10.371-23.658 0 0"
        />
      </svg>
      <svg
        className={join(styles.piece, styles.disc, discClass)}
        viewBox={MEDAL_VIEWBOX}
        focusable="false"
        aria-hidden="true"
      >
        <path
          transform="matrix(1,0,0,-1,270.604,495.47209)"
          d="M0 0C0-58.433-47.369-105.802-105.802-105.802-164.235-105.802-211.604-58.433-211.604 0-211.604 58.433-164.235 105.802-105.802 105.802-47.369 105.802 0 58.433 0 0"
        />
      </svg>
    </span>
  );
}
