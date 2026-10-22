"use client";

// Scene (types 2 and 3) of the 404: a field types the address the visitor
// asked for, then "Nothing on the bench here." comes up under it; an empty
// hairline frame marks where a piece would be, and a few quiet marks drift
// past it. Nothing lands. Drawn in style A.
//
// The address is only known in the browser (location.pathname), so this
// small island writes it into the typed text and sizes the typing step
// before SceneDriver reads them: a layout effect runs before every passive
// effect, the driver's included. The rest is the shared Scene markup.
import { type CSSProperties, useLayoutEffect, useRef } from "react";
import { TbWorld } from "react-icons/tb";
import { Scene, Typed, typeTime } from "../Scene";
import s from "./lost.module.scss";

/** Until the address is known; hidden without scripting (see .address). */
const PLACEHOLDER = "/";
/** Longer addresses are cut, so the field keeps its size. */
const MAX = 40;

/** Step 0: the field and the frame come in; 1: the address types; 2: the answer, final. */
const steps = (address: string) => [700, typeTime(address) + 700, 0];

/** The quiet marks: where each rests and where it drifts to (cqi), and its loop (s). */
const MARKS: { kind: string; x: number; y: number; dx: number; dy: number; t: number }[] = [
  { kind: "ring", x: 15, y: 42, dx: 7, dy: -2, t: 9 },
  { kind: "dot", x: 26, y: 64, dx: 6, dy: 1.5, t: 7.5 },
  { kind: "square", x: 76, y: 37, dx: -6, dy: 2, t: 10 },
  { kind: "stroke", x: 70, y: 62, dx: 7, dy: -1.5, t: 8.5 },
  { kind: "small", x: 86, y: 52, dx: -5, dy: -2, t: 7 },
  { kind: "grey", x: 9, y: 70, dx: 6, dy: -1, t: 11 },
];

function askedAddress() {
  let address = window.location.pathname;
  try {
    address = decodeURIComponent(address);
  } catch {
    // A malformed escape: keep the address as it came.
  }
  return address.length > MAX ? `${address.slice(0, MAX - 1)}…` : address;
}

export function LostScene() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current?.querySelector<HTMLElement>("[data-scene]");
    const typed = root?.querySelector<HTMLElement>("[data-type]");
    if (!root || !typed) return;
    const address = askedAddress();
    typed.dataset.type = JSON.stringify([address]);
    // The first child is the invisible copy that sizes the box.
    if (typed.firstElementChild) typed.firstElementChild.textContent = address;
    root.dataset.steps = steps(address).join(",");
  }, []);

  return (
    <div className={s.stage} ref={ref}>
      <Scene className={s.scene} steps={steps(PLACEHOLDER)}>
        <div className={s.field}>
          <TbWorld className={s.globe} />
          <Typed text={PLACEHOLDER} at={1} className={s.address} />
        </div>
        <p className={s.answer}>Nothing on the bench here.</p>
        <span className={s.empty} />
        {MARKS.map((m, k) => (
          <span
            key={m.kind}
            className={`${s.mark} ${s[m.kind]}`}
            style={
              {
                "--x": `${m.x}cqi`,
                "--y": `${m.y}cqi`,
                "--dx": `${m.dx}cqi`,
                "--dy": `${m.dy}cqi`,
                "--dur": `${m.t}s`,
                "--k": k,
              } as CSSProperties
            }
          >
            <i />
          </span>
        ))}
      </Scene>
    </div>
  );
}
