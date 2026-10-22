// Scene (type 4, one per step of the Visual Work stepper): how a piece is
// made, without showing any. A blank 9:16 frame gets a presenter, then
// motion, a voice, an edit, and it is posted. The four scenes share one
// composition, so as the stepper crossfades from one to the next only the
// new part moves: whatever an earlier step made is already in place. Drawn
// in style A: hairlines, the presenter and the accents in cobalt.
//
// Facts: content.tsx `gallery.description` (one person, usually in hours);
// ai-powered-ad-creatives.mdx, "The AI Production Pipeline" (the presenter
// generated in Higgsfield with Nano Banana Pro, animated with Kling 3.0, an
// ElevenLabs voice, post-production in CapCut Pro); and
// quick-metal-shop-viral-videos.mdx, "The Process" (cross-posted to Instagram
// and Facebook). No piece of Visual Work is used.
import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { TbCheck, TbMicrophone, TbScissors, TbUser, TbWand } from "react-icons/tb";
import { Scene } from "../Scene";
import s from "./piecemaking.module.scss";

export type MakingStage = 0 | 1 | 2 | 3;

/** The four steps (titles confirmed by Erick) and the tools each one uses. */
export const MAKING: { title: string; tools: string; Icon: IconType }[] = [
  { title: "Avatar", tools: "Higgsfield, Nano Banana Pro", Icon: TbUser },
  { title: "Motion", tools: "Kling 3.0", Icon: TbWand },
  { title: "Voice", tools: "ElevenLabs", Icon: TbMicrophone },
  { title: "Edit and post", tools: "CapCut Pro", Icon: TbScissors },
];

/**
 * How long each scene stays at each of its steps (ms). Step 0: the frame is
 * there (it enters in the first scene); step 1: the step's key lights and its
 * line joins the list; step 2: the frame changes; the last step rests.
 */
const STEPS: Record<MakingStage, number[]> = {
  0: [700, 800, 0],
  1: [500, 800, 0],
  2: [500, 800, 0],
  3: [500, 800, 1500, 0],
};

const WAVE = [0.4, 0.75, 0.55, 1, 0.6, 0.85, 0.45, 0.95, 0.5, 0.7, 0.4].map((h, k) => ({
  h,
  id: `bar${k}`,
}));

export function PieceMaking({ stage }: { stage: MakingStage }) {
  // A part made at step `of` enters at the scene's step `at` when `of` is
  // this scene's stage; a part from an earlier stage is drawn in place.
  const enter = (of: number, at: number) => (of === stage ? s[`in${at}`] : "");
  // A loop of a part made at step `of`: from the scene's step 2 in its own
  // scene, from the start in the later ones.
  const loop = (of: number) => (of === stage ? s.loopFrom2 : s.loopFrom0);
  const has = (of: number) => of <= stage;

  return (
    <Scene className={s.scene} steps={STEPS[stage]}>
      <div className={`${s.frame} ${stage === 0 ? s.in0 : ""}`}>
        {has(3) && <span className={`${s.progress} ${enter(3, 2)}`} />}
        {has(0) && (
          <span className={`${s.presenter} ${enter(0, 2)}`}>
            <span className={`${s.bob} ${has(1) ? loop(1) : ""}`}>
              <span className={s.head}>
                <span className={`${s.mouth} ${has(1) ? loop(1) : ""}`} />
              </span>
              <span className={s.body} />
            </span>
          </span>
        )}
        {has(3) && (
          <span className={`${s.captions} ${enter(3, 2)}`}>
            <i />
            <i />
          </span>
        )}
        {has(2) && (
          <span className={s.wave}>
            {WAVE.map((bar, k) => (
              <i
                key={bar.id}
                className={enter(2, 2)}
                style={{ "--h": bar.h, "--k": k } as CSSProperties}
              >
                <b className={loop(2)} />
              </i>
            ))}
          </span>
        )}
        {has(1) && (
          <span className={`${s.track} ${enter(1, 2)}`}>
            <span className={`${s.playhead} ${loop(1)}`} />
          </span>
        )}
      </div>

      <ol className={`${s.keys} ${stage === 0 ? s.in0 : ""}`}>
        {MAKING.map(({ title, Icon }, k) => (
          <li
            key={title}
            className={`${s.key} ${k < stage ? s.done : k === stage ? s.now : s.later}`}
          >
            <Icon />
          </li>
        ))}
      </ol>

      <ul className={s.list}>
        {MAKING.slice(0, stage + 1).map(({ title, tools }, k) => (
          <li key={title} className={`${s.row} ${enter(k, 1)}`}>
            <span className={s.step}>{title}</span>
            <span className={s.tools}>{tools}</span>
          </li>
        ))}
      </ul>

      {has(3) && (
        <ul className={s.posted}>
          {["Instagram", "Facebook"].map((where, k) => (
            <li
              key={where}
              className={`${s.target} ${enter(3, 3)}`}
              style={{ "--k": k } as CSSProperties}
            >
              <TbCheck className={s.tick} />
              {where}
            </li>
          ))}
        </ul>
      )}
    </Scene>
  );
}
