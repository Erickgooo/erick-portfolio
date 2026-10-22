// Scene (type 1): an edit cut to its song. The soundtrack's waveform rises
// and its beats appear; the edit's cuts drop onto beats; then a playhead
// runs over both tracks and the picture above changes at every cut, on the
// beat.
//
// Facts: src/app/work/projects/quick-metal-shop-the-brand-comes-to-life.mdx,
// "Act Two · The Video" (an original soundtrack; the cuts, camera moves and
// scene changes timed to the exact rhythm of the song). The picture is
// drawn (the stand's hexagons, a perforated panel, a title, the stand): no
// frame of the real video. Drawn in the site's palette. Landscape (5:4)
// only, in a WideSheet.
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import s from "./beatcuts.module.scss";

/** The beats, as fractions of the tracks' width; the cuts land on four of them. */
const BEATS = Array.from({ length: 8 }, (_, i) => (i + 0.5) / 8);
const CUT_BEATS = [1, 3, 4, 6];
const CUTS = CUT_BEATS.map((b) => BEATS[b]);
const EDGES = [0, ...CUTS, 1];
const CLIPS = EDGES.slice(0, -1).map((a, k) => ({ id: `clip${k}`, a, b: EDGES[k + 1] }));

const BARS = Array.from({ length: 44 }, (_, j) => {
  const x = (j + 0.5) / 44;
  const onBeat = BEATS.some((b) => Math.abs(b - x) < 0.012);
  const h = onBeat ? 1 : 0.3 + 0.55 * Math.abs(Math.sin(j * 1.7) * Math.cos(j * 0.37));
  return { id: `bar${j}`, h: Math.round(h * 100) / 100 };
});

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

function hex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 2;
    return `${Math.round((cx + r * Math.cos(a)) * 100) / 100},${Math.round((cy + r * Math.sin(a)) * 100) / 100}`;
  }).join(" ");
}

export function BeatCuts() {
  return (
    <Scene className={s.scene} steps={[700, 1300, 900, 1900, 4200, 2600]} loop>
      <div className={s.preview}>
        {/* One picture per clip; each later one is cut in as the playhead reaches its cut. */}
        <span className={`${s.comp} ${s.hexes}`}>
          <svg viewBox="0 0 64 36" aria-hidden="true">
            <polygon points={hex(20, 12, 7)} />
            <polygon points={hex(32.1, 12, 7)} className={s.accent} />
            <polygon points={hex(44.2, 12, 7)} />
            <polygon points={hex(26, 22.5, 7)} />
            <polygon points={hex(38.1, 22.5, 7)} />
          </svg>
        </span>
        <span className={`${s.comp} ${s.panel}`} style={v({ "--at": CUTS[0] })}>
          <i />
        </span>
        <span className={`${s.comp} ${s.title}`} style={v({ "--at": CUTS[1] })}>
          <i />
          <b />
        </span>
        <span className={`${s.comp} ${s.stand}`} style={v({ "--at": CUTS[2] })}>
          <i />
          <b />
        </span>
        <span className={`${s.comp} ${s.close}`} style={v({ "--at": CUTS[3] })}>
          <svg viewBox="0 0 64 36" aria-hidden="true">
            <polygon points={hex(32, 18, 12)} className={s.accent} />
          </svg>
        </span>
      </div>

      <span className={`${s.trackName} ${s.editName}`}>Edit</span>
      <div className={`${s.track} ${s.edit}`}>
        {CLIPS.map((c) => (
          <i key={c.id} style={v({ "--a": c.a, "--b": c.b })} />
        ))}
      </div>

      <span className={`${s.trackName} ${s.songName}`}>Soundtrack</span>
      <div className={`${s.track} ${s.song}`}>
        <span className={s.wave}>
          {BARS.map((bar, k) => (
            <i key={bar.id} style={v({ "--h": bar.h, "--k": k })} />
          ))}
        </span>
      </div>

      <span className={s.beats}>
        {BEATS.map((p, i) => {
          const hit = CUT_BEATS.indexOf(i);
          return (
            <i
              key={p}
              className={hit >= 0 ? s.hit : undefined}
              style={v({ "--p": p, "--i": i, "--k": Math.max(0, hit) })}
            />
          );
        })}
      </span>
      <span className={s.cuts}>
        {CUTS.map((p, k) => (
          <i key={p} style={v({ "--p": p, "--k": k })} />
        ))}
      </span>
      <span className={s.playhead} />
    </Scene>
  );
}
