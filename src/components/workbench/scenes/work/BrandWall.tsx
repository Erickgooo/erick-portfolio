// Scene (type 1): the brand manual turned into space. A manual opens (its
// palette, its type, its hexagonal pattern); the pattern's tile leaves the
// page for the stand's wall, where the hexagonal tiles assemble around it;
// then the sign and the counter complete the stand.
//
// Facts: src/app/work/projects/quick-metal-shop-the-brand-comes-to-life.mdx,
// "Act One · The Booth" (every rule of the manual translated into the booth;
// the manual's hexagonal patterns across the ceiling and the panels). Drawn
// in the site's palette (cobalt, ink, mist), not the client's. Portrait (4:5)
// only.
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import s from "./brandwall.module.scss";

// The wall: pointy-top hexagons of radius R, in the wall's own units (cqi),
// 90 x 66, the size of the wall box.
const R = 6;
const W = Math.sqrt(3) * R;
const WALL = { x: 5, y: 46, w: 90, h: 66 };
const SEED = { c: 4, r: 1 };

const round = (v: number) => Math.round(v * 100) / 100;

function hexPoints(cx: number, cy: number, r = R) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    return `${round(cx + r * Math.cos(a))},${round(cy + r * Math.sin(a))}`;
  }).join(" ");
}

const centre = (c: number, r: number) => ({
  x: c * W + (r % 2 ? W / 2 : 0),
  y: R + r * R * 1.5,
});

const seed = centre(SEED.c, SEED.r);

const HEXES = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 10 }, (_, c) => {
    const { x, y } = centre(c, r);
    const d = Math.hypot(x - seed.x, y - seed.y);
    return {
      id: `x${c}-${r}`,
      points: hexPoints(x, y),
      d: Math.round(d * 22),
      accent: (c * 7 + r * 3) % 9 === 0,
      isSeed: c === SEED.c && r === SEED.r,
    };
  }),
).flat();

/** Where the seed tile sits on the manual's page, in the sheet's cqi. */
const PAGE_TILE = { x: 48, y: 22 };

export function BrandWall() {
  const seedBox = {
    left: `${round(WALL.x + seed.x - W / 2)}cqi`,
    top: `${round(WALL.y + seed.y - R)}cqi`,
    width: `${round(W)}cqi`,
    height: `${2 * R}cqi`,
    "--dx": `${round(PAGE_TILE.x - (WALL.x + seed.x))}cqi`,
    "--dy": `${round(PAGE_TILE.y - (WALL.y + seed.y))}cqi`,
  } as CSSProperties;

  return (
    <Scene className={s.scene} steps={[700, 1000, 1000, 1100, 2300, 1100, 3400]} loop>
      <span className={s.bookName}>Brand manual</span>
      <div className={s.book}>
        <div className={s.page}>
          <span className={s.swatches}>
            <i className={s.cobalt} style={{ "--k": 0 } as CSSProperties} />
            <i className={s.ink} style={{ "--k": 1 } as CSSProperties} />
            <i className={s.mist} style={{ "--k": 2 } as CSSProperties} />
          </span>
          <span className={s.specimen}>Aa</span>
        </div>
        <div className={`${s.page} ${s.pageRight}`}>
          <svg className={s.tile} viewBox="0 0 26 22" aria-hidden="true">
            <polygon points={hexPoints(7.5, 7, 6)} />
            <polygon points={hexPoints(18.5, 7, 6)} />
            <polygon points={hexPoints(13, 16, 6)} />
          </svg>
          <span className={s.lines}>
            <i />
            <i />
          </span>
        </div>
      </div>

      <div className={s.wall}>
        <svg
          className={s.hexes}
          viewBox={`0 0 ${WALL.w} ${WALL.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {HEXES.map((h) => (
            <polygon
              key={h.id}
              points={h.points}
              className={h.isSeed ? s.seedSlot : h.accent ? `${s.hex} ${s.accent}` : s.hex}
              style={{ "--d": h.d } as CSSProperties}
            />
          ))}
        </svg>
        <span className={s.sign}>
          <i />
          <b />
        </span>
      </div>

      <span className={s.seed} style={seedBox}>
        <svg viewBox={`0 0 ${round(W)} ${2 * R}`} aria-hidden="true">
          <polygon points={hexPoints(W / 2, R)} />
        </svg>
      </span>

      <span className={s.counter} />
      <span className={s.floor} />
    </Scene>
  );
}
