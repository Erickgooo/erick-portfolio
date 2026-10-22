// Scene (type 1): a burst of chats, sorted at the first message. New chats
// pour in while the daily volume counts up to its real value; the assistant
// greets with three buttons (View Catalog, I Have Questions, I Want to Buy);
// a buyer taps the last one and the chat goes to the advisor lane; a chat
// that goes silent gets a follow-up at 60 minutes, then closes.
//
// Facts: src/app/work/projects/atv-riders.mdx (metric "200+|leads/day";
// "Chatbot Architecture": a greeting and three buttons, "I Want to Buy"
// flagged for a sales advisor; "Automated Re-engagement & Closure Logic": a
// follow-up after 60 minutes without a reply, then the chat is closed). A
// generic chat and board, drawn: no WhatsApp or Kommo interface or logo. The
// greeting is generic filler, attributed to no one. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import s from "./chattriage.module.scss";

const ROWS = ["r0", "r1", "r2", "r3", "r4", "r5"];
const BUTTONS = ["View Catalog", "I Have Questions", "I Want to Buy"];

export function ChatTriage() {
  return (
    <Scene className={s.scene} steps={[800, 2000, 800, 1300, 1000, 1300, 1700, 4200]} loop>
      <div className={s.inbox}>
        <span className={s.rows}>
          {ROWS.map((id, k) => (
            <span key={id} className={s.row} style={{ "--k": k } as CSSProperties}>
              <i />
              <b />
            </span>
          ))}
        </span>
        <span className={s.volume}>
          <CountUp value="200+" at={1} duration={1800} className={s.value} />
          <span className={s.caption}>leads/day</span>
        </span>
      </div>

      <div className={s.chat}>
        <div className={s.head}>
          <span className={s.avatar} />
          <span className={s.name}>Assistant</span>
        </div>
        <div className={s.thread}>
          <div className={s.slot}>
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
            <p className={s.greet}>Hi! What can we help you with?</p>
          </div>
          <span className={s.buttons}>
            {BUTTONS.map((label, k) => (
              <span
                key={label}
                className={k === 2 ? `${s.button} ${s.buy}` : s.button}
                style={{ "--k": k } as CSSProperties}
              >
                {label}
                {k === 2 ? <span className={s.ring} /> : null}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className={s.advisor}>
        <span className={s.laneName}>Advisor</span>
        <span className={s.cards}>
          <span className={s.card}>
            <b />
          </span>
          <span className={s.card}>
            <b />
          </span>
          <span className={`${s.card} ${s.newCard}`}>
            <b />
          </span>
        </span>
      </div>

      <div className={s.silent}>
        <span className={s.laneName}>Follow-up</span>
        <span className={s.flow}>
          <span className={s.quiet}>
            <i />
            <b />
          </span>
          <span className={s.wait}>
            <span className={s.waitLabel}>
              <span className={s.clock} />
              60 min
            </span>
            <span className={`${s.link} ${s.link1}`} />
          </span>
          <span className={s.follow}>
            <b />
          </span>
          <span className={`${s.link} ${s.link2}`} />
          <span className={s.closed}>Closed</span>
        </span>
      </div>
    </Scene>
  );
}
