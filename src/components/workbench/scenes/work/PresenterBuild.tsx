// Scenes (type 4 steps): the four-stage avatar pipeline, each stage building
// the same presenter in a video frame. 0, avatar creation: faces are drawn,
// one is chosen and becomes the presenter; 1, animation: it moves on a
// keyframed timeline; 2, voice: a voice track is matched to the script; 3,
// post-production: captions, the edit's tracks, and the piece is ready to go
// live. Each stage shows what the earlier ones built.
//
// Facts: src/app/work/projects/ai-powered-ad-creatives.mdx, "Behind the
// Scenes" (1. avatar creation, 2. animation with natural motion, expression
// and lip movement, 3. a voice track matched to the script, 4. captions,
// edit pacing and voice-over layering before the ad goes live). Drawn: no
// frame of the real creatives and no tool's interface or logo. For a
// MarginStepper sheet (5:4, the top band left free).
import type { CSSProperties } from "react";
import { TbMicrophone } from "react-icons/tb";
import { Scene } from "../Scene";
import s from "./presenterbuild.module.scss";

export type PresenterStage = 0 | 1 | 2 | 3;

const STEPS: Record<PresenterStage, number[]> = {
  0: [700, 1300, 1000, 1300, 3400],
  1: [700, 900, 2800, 3200],
  2: [700, 1300, 1500, 3400],
  3: [700, 900, 2700, 1000, 3200],
};

const FACES = [
  { id: "f0", head: 0.4, body: 0.86 },
  { id: "f1", head: 0.34, body: 0.78 },
  { id: "f2", head: 0.37, body: 0.92 },
  { id: "f3", head: 0.42, body: 0.8 },
];
const KEYS = [
  { id: "k0", track: 0, at: 0.08 },
  { id: "k1", track: 0, at: 0.46 },
  { id: "k2", track: 0, at: 0.82 },
  { id: "k3", track: 1, at: 0.24 },
  { id: "k4", track: 1, at: 0.64 },
  { id: "k5", track: 2, at: 0.14 },
  { id: "k6", track: 2, at: 0.36 },
  { id: "k7", track: 2, at: 0.58 },
  { id: "k8", track: 2, at: 0.88 },
];
const WAVE = [
  0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.45, 0.8, 0.55, 0.95, 0.5, 0.75, 0.4, 0.85, 0.6, 0.5,
].map((h, k) => ({ h, id: `w${k}` }));
const CLIPS = [
  { id: "c0", from: 0, to: 0.3 },
  { id: "c1", from: 0.32, to: 0.66 },
  { id: "c2", from: 0.68, to: 1 },
];
const CAPS = [
  { id: "t0", from: 0.04, to: 0.26 },
  { id: "t1", from: 0.36, to: 0.6 },
  { id: "t2", from: 0.7, to: 0.94 },
];

const pos = (from: number, to: number) => ({ "--a": from, "--b": to }) as CSSProperties;

export function PresenterBuild({ stage }: { stage: PresenterStage }) {
  const names = [s.scene, stage === 0 ? s.fresh : "", stage >= 1 ? s.moving : ""];
  return (
    <Scene className={names.filter(Boolean).join(" ")} steps={STEPS[stage]} loop>
      <div className={s.frame}>
        <span className={s.outline} />
        <span className={s.presenter}>
          <span className={s.headWrap}>
            <span className={s.head}>
              <i className={s.eyes} />
              <i className={s.mouth} />
            </span>
          </span>
          <span className={s.body} />
        </span>
        {stage === 1 ? (
          <span className={s.motion}>
            <i />
            <i />
          </span>
        ) : null}
        {stage >= 3 ? (
          <>
            <span className={s.captions}>
              <i />
              <i />
            </span>
            <span className={s.ready} />
          </>
        ) : null}
      </div>

      <div className={s.panel}>
        {stage === 0 ? <Faces /> : null}
        {stage === 1 ? <Keys /> : null}
        {stage === 2 ? <Voice /> : null}
        {stage === 3 ? <Edit /> : null}
      </div>
    </Scene>
  );
}

function Faces() {
  return (
    <span className={s.faces}>
      {FACES.map((f, k) => (
        <span
          key={f.id}
          className={k === 2 ? `${s.face} ${s.chosen}` : s.face}
          style={{ "--k": k, "--hd": f.head, "--bd": f.body } as CSSProperties}
        >
          <i />
          <b />
        </span>
      ))}
    </span>
  );
}

function Keys() {
  return (
    <span className={s.timeline}>
      {[0, 1, 2].map((t) => (
        <span key={t} className={s.track} style={{ "--k": t } as CSSProperties}>
          {KEYS.filter((key) => key.track === t).map((key, n) => (
            <i
              key={key.id}
              className={s.key}
              style={{ "--at": key.at, "--n": n + t * 2 } as CSSProperties}
            />
          ))}
        </span>
      ))}
      <span className={s.playhead} />
    </span>
  );
}

function Voice() {
  return (
    <span className={s.voice}>
      <span className={s.mic}>
        <TbMicrophone />
      </span>
      <span className={s.script}>
        {[0, 1, 2].map((k) => (
          <i key={k} style={{ "--k": k } as CSSProperties} />
        ))}
      </span>
      <span className={s.wave}>
        {WAVE.map((bar, k) => (
          <i key={bar.id} style={{ "--h": bar.h, "--k": k } as CSSProperties} />
        ))}
      </span>
    </span>
  );
}

function Edit() {
  return (
    <span className={s.edit}>
      <span className={`${s.lane} ${s.clips}`}>
        {CLIPS.map((c) => (
          <i key={c.id} style={pos(c.from, c.to)} />
        ))}
      </span>
      <span className={`${s.lane} ${s.voiceLane}`}>
        {WAVE.map((bar) => (
          <i key={bar.id} style={{ "--h": bar.h } as CSSProperties} />
        ))}
      </span>
      <span className={`${s.lane} ${s.caps}`}>
        {CAPS.map((c) => (
          <i key={c.id} style={pos(c.from, c.to)} />
        ))}
      </span>
      <span className={s.playhead} />
    </span>
  );
}
