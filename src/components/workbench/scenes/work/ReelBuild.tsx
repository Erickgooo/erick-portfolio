// Scene (type 1): a content engine at work. A short video assembles itself
// in a phone frame (a plain wall turns into the finished piece, captions,
// voice, the edit) while the steps of the pipeline light up, then it is
// posted next to the other reels, an article lands on the published pile,
// and the organic views count up to their real total.
//
// Facts: src/app/work/projects/quick-metal-shop-viral-videos.mdx (metric
// "338K+|organic views"; before/after hook, animation, script, voice, edit,
// cross-posting; three flagship reels; zero ad spend) and the automated SEO
// publishing of quick-metal-shop-marketing.mdx and dakoma-roofing.mdx. The
// pipeline steps are icons only; no frame of the real videos is used. Sober
// (2026-10-22): drawn in line. With `views` (the case page) the three
// flagship reels land with their views (the ResultsStats of each reel), then
// the total.
import type { CSSProperties } from "react";
import type { IconType } from "react-icons";
import { TbMicrophone, TbPencil, TbPhoto, TbScissors, TbSend, TbWand } from "react-icons/tb";
import { CountUp, Scene } from "../Scene";
import s from "./reelbuild.module.scss";

/** The pipeline, in order: before/after hook, animation, script, voice, edit, posting. */
const PIPELINE: { id: string; Icon: IconType }[] = [
  { id: "hook", Icon: TbPhoto },
  { id: "animate", Icon: TbWand },
  { id: "script", Icon: TbPencil },
  { id: "voice", Icon: TbMicrophone },
  { id: "edit", Icon: TbScissors },
  { id: "post", Icon: TbSend },
];
const WAVE = [0.35, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 1, 0.55, 0.75, 0.45, 0.85, 0.5, 0.65].map(
  (h, k) => ({ h, id: `bar${k}` }),
);

/** The three flagship reels and their views, from the case's ResultsStats. */
const REELS = [
  { id: "reel1", views: "110K" },
  { id: "reel2", views: "125K" },
  { id: "reel3", views: "103K" },
];

export function ReelBuild({
  portrait = false,
  views = false,
}: {
  portrait?: boolean;
  /**
   * The case's version (portrait): after the build, the three flagship reels
   * land one by one with their views (110K, 125K, 103K), then the 338K+
   * total. No article pile: that is another case's work.
   */
  views?: boolean;
}) {
  const names = [s.scene, portrait || views ? s.portrait : "", views ? s.views : ""];
  return (
    <Scene
      className={names.filter(Boolean).join(" ")}
      steps={
        views
          ? [800, 1000, 1500, 1100, 1400, 1300, 1300, 1300, 1300, 3800]
          : [800, 1000, 1500, 1100, 1400, 1300, 1300, 3800]
      }
      loop
    >
      <div className={s.reel}>
        <div className={s.screen}>
          <span className={s.wall} />
          <span className={s.after}>
            <span className={s.perf} />
          </span>
          <span className={s.captions}>
            <i />
            <i />
          </span>
          <span className={s.wave}>
            {WAVE.map((bar) => (
              <i key={bar.id} style={{ "--h": bar.h } as CSSProperties} />
            ))}
          </span>
          <span className={s.progress} />
        </div>
      </div>

      <ol className={s.steps}>
        {PIPELINE.map(({ id, Icon }) => (
          <li key={id} className={s.step}>
            <Icon />
          </li>
        ))}
      </ol>

      {views ? (
        <>
          <div className={s.landed}>
            {REELS.map((reel, k) => (
              <span key={reel.id} className={s.landedReel} style={{ "--k": k } as CSSProperties}>
                <span className={s.thumb} />
                <CountUp value={reel.views} at={6 + k} className={s.reelViews} duration={1100} />
              </span>
            ))}
          </div>

          <div className={s.total}>
            <CountUp value="338K+" at={9} className={s.value} duration={1600} />
            <span className={s.caption}>organic views</span>
          </div>
        </>
      ) : (
        <>
          <div className={s.pile}>
            <span className={s.sheet} />
            <span className={s.sheet}>
              <i />
              <i />
              <i />
            </span>
            <span className={`${s.sheet} ${s.newSheet}`}>
              <i />
              <i />
              <i />
            </span>
          </div>

          <div className={s.thumbs}>
            <span className={s.thumb} />
            <span className={s.thumb} />
            <span className={`${s.thumb} ${s.newThumb}`} />
          </div>

          <div className={s.tag}>
            <CountUp value="338K+" at={7} className={s.value} duration={1600} />
            <span className={s.caption}>organic views</span>
          </div>
        </>
      )}
    </Scene>
  );
}
