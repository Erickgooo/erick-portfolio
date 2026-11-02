// Scene (type 1): the website-launch campaign's production chain. The site's
// medal is captured frame by frame (it turns a little from frame to frame);
// the frames, the voice with its subtitles and the music made in code fill
// the tracks of the edit and a playhead runs through them; the QA's checks
// tick one by one and the pieces pass.
//
// Facts: src/app/work/projects/incentiva-launch-campaign.mdx ("recorded frame
// by frame in a headless Chromium browser", "edited in Remotion with
// voice-aligned subtitles", "music synthesized in Python", "13-point QA",
// "-14 LUFS", "contrast of at least 8.5:1", "pixel-exact logo"). The medal is
// the official mark (IncentivaMedal). No editor interface. Portrait (4:5).
import type { CSSProperties } from "react";
import { Scene } from "../Scene";
import { IncentivaMedal } from "./IncentivaMedal";
import s from "./launchchain.module.scss";

/** How much of its width each captured frame shows: the medal turning. */
const TURN = [1, 0.74, 0.4, 0.74, 1];
const TRACKS = ["Medal frames", "Voice and subtitles", "Music, in code"];
const CHECKS = [
  "Loudness -14 LUFS",
  "OCR = script",
  "Safe zones",
  "Contrast 8.5:1+",
  "Pixel-exact logo",
];

export function LaunchChain() {
  return (
    <Scene className={s.scene} steps={[1700, 1500, 1800, 1900, 4400]} loop>
      <div className={s.capture}>
        <span className={s.head}>
          <span className={s.label}>Frame-by-frame capture</span>
          <span className={s.note}>headless Chromium</span>
        </span>
        <span className={s.strip}>
          {TURN.map((turn, k) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed frames
              key={k}
              className={s.frame}
              style={{ "--k": k, "--turn": turn } as CSSProperties}
            >
              <IncentivaMedal className={s.medal} ribbonClass={s.ribbon} discClass={s.disc} />
            </span>
          ))}
        </span>
      </div>

      <div className={s.edit}>
        <span className={s.head}>
          <span className={s.label}>Edit in code</span>
          <span className={s.note}>Remotion</span>
        </span>
        <span className={s.tracks}>
          {TRACKS.map((t, k) => (
            <span key={t} className={s.track} style={{ "--k": k } as CSSProperties}>
              <span className={s.trackName}>{t}</span>
              <span className={s.lane}>
                <i />
              </span>
            </span>
          ))}
          <i className={s.playhead} />
        </span>
      </div>

      <div className={s.qa}>
        <span className={s.head}>
          <span className={s.label}>13-point QA</span>
          <span className={s.passed}>
            <i className={s.tick} />
            both videos passed
          </span>
        </span>
        <span className={s.checks}>
          {CHECKS.map((c, k) => (
            <span key={c} className={s.check} style={{ "--k": k } as CSSProperties}>
              <i className={s.tick} />
              {c}
            </span>
          ))}
        </span>
      </div>
    </Scene>
  );
}
