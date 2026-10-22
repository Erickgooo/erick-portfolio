// Post "My Workspace", scene (type 1): the workspace drawn in line, without
// its photos. Its parts light up in cobalt as the post reaches them: the
// machine (the tower, the two monitors and the keyboard), audio and video
// (the microphone and the webcam), the room (the lamp: controlled lighting)
// and Notion (a page of notes on one screen); at "The Bigger Picture"
// everything is lit. Each name under it is the section's own heading.
//
// Two modes, one drawing:
// - "read" (desktop, in the margin beside the index): PostIndex writes the
//   current section's part into data-part as the visitor reads; no timers.
// - "loop" (phones, in the flow under the header, not pinned): a Scene that
//   lights the parts one after another when it enters the view, then all of
//   them, and runs again while on screen.
// Without scripting, and with reduced motion, everything shows lit.
import type { ReactNode } from "react";
import { Scene } from "../Scene";
import styles from "./desk.module.scss";

function Machine() {
  return (
    <>
      <rect x="66" y="88" width="94" height="60" rx="3" />
      <path d="M113 148v18M100 166h26" />
      <rect x="168" y="88" width="94" height="60" rx="3" />
      <path d="M215 148v18M202 166h26" />
      <rect x="120" y="158" width="78" height="6" rx="1.5" />
      <rect x="238" y="176" width="34" height="52" rx="3" />
      <path d="M246 188h18M246 194h18" />
      <circle cx="255" cy="216" r="3" />
    </>
  );
}

function AudioVideo() {
  return (
    <>
      <path d="M42 166v-50l20-16" />
      <rect x="57" y="74" width="13" height="26" rx="6.5" />
      <path d="M60 82h7M60 88h7" />
      <rect x="104" y="80" width="18" height="8" rx="2" />
      <circle cx="113" cy="84" r="1.8" />
    </>
  );
}

function Room() {
  return (
    <>
      <path d="M276 166h18M285 166l-12-44 22-22" />
      <path d="M289 92l18 10-10 14z" />
      <path d="M302 122l6 6M296 128l2 8M308 116l8 2" />
    </>
  );
}

function Notion() {
  return (
    <>
      <rect x="176" y="98" width="7" height="7" rx="1" />
      <path d="M189 101.5h40M176 114h66M176 123h54M176 132h60" />
    </>
  );
}

const PARTS: { key: "machine" | "av" | "room" | "notion"; draw: () => ReactNode }[] = [
  { key: "machine", draw: Machine },
  { key: "av", draw: AudioVideo },
  { key: "room", draw: Room },
  { key: "notion", draw: Notion },
];

const CAPTIONS: { key: string; text: string }[] = [
  { key: "machine", text: "The Machine" },
  { key: "av", text: "Audio & Video" },
  { key: "room", text: "The Physical Environment" },
  { key: "notion", text: "Notion" },
  { key: "all", text: "The Bigger Picture" },
];

function Drawing() {
  return (
    <>
      <svg className={styles.svg} viewBox="0 58 320 180" fill="none" aria-hidden="true">
        <g className={styles.base}>
          <path className={styles.floor} d="M8 228h304" />
          <rect x="28" y="166" width="264" height="6" rx="2" />
          <path d="M42 172v56M278 172v56" />
          {PARTS.map(({ key, draw: Draw }) => (
            <g key={key}>
              <Draw />
            </g>
          ))}
        </g>
        {PARTS.map(({ key, draw: Draw }) => (
          <g key={key} className={styles.lit} data-lit={key}>
            <Draw />
          </g>
        ))}
      </svg>
      <span className={styles.captions}>
        {CAPTIONS.map((c) => (
          <span key={c.key} className={styles.caption} data-cap={c.key}>
            {c.text}
          </span>
        ))}
      </span>
    </>
  );
}

export function DeskScene({ mode }: { mode: "read" | "loop" }) {
  if (mode === "read") {
    return (
      <div className={`${styles.desk} ${styles.read}`} data-desk="" aria-hidden="true">
        <Drawing />
      </div>
    );
  }
  return (
    <Scene
      className={`${styles.desk} ${styles.loop}`}
      steps={[600, 1800, 1800, 1800, 1800, 2800]}
      loop
    >
      <Drawing />
    </Scene>
  );
}
