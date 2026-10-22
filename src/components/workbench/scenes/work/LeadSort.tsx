// Scene (type 1): a lead-qualifying bot at work. A conversation comes in, the
// bot answers in seconds and asks what sales needs (product, volume,
// location), the answers fill the lead's card and the card goes to the
// "Sales-ready" lane, while other questions are answered and filed on their
// own; the share of conversations automated counts up to its real value.
// A generic chat and board, drawn: no third-party interface or logo. Sober
// (2026-10-22): drawn in line in variant A, on flat surfaces in variant B.
//
// Facts: src/app/work/projects/leadbot-ai.mdx (metric "85%|conversations
// automated"; qualifying B2B leads with product interest, volume and
// location; answering B2C inquiries; sales-ready leads to the team; replies
// in seconds, 24/7). The chat lines are generic filler, attributed to no one.
import type { CSSProperties } from "react";
import { CountUp, Scene, Typed, typeTime } from "../Scene";
import s from "./leadsort.module.scss";

const ASK = "Great. Which products, what volume, and where?";

export function LeadSort({
  status,
  portrait = false,
}: {
  /** A short line under the assistant's name, from the page's own text (e.g. "24/7"). */
  status?: string;
  /** Always the portrait layout (a narrow column), not only on phones. */
  portrait?: boolean;
}) {
  return (
    <Scene
      className={portrait ? `${s.scene} ${s.portrait}` : s.scene}
      steps={[900, 750, 950, typeTime(ASK) + 600, 900, 1500, 1300, 3600]}
      loop
    >
      <div className={s.chat}>
        <div className={s.head}>
          <span className={s.avatar} />
          <span className={s.who}>
            <span className={s.name}>Assistant</span>
            {status ? <span className={s.status}>{status}</span> : null}
          </span>
        </div>
        <div className={s.thread}>
          <p className={`${s.msg} ${s.in} ${s.m1}`}>Hi! Do you supply caf&eacute;s?</p>
          <div className={s.slot}>
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
            <p className={`${s.msg} ${s.out} ${s.m2}`}>
              <Typed text={ASK} at={3} />
            </p>
          </div>
          <p className={`${s.msg} ${s.in} ${s.m3}`}>
            Bread and pastries, weekly, for two locations.
          </p>
          <div className={s.summary}>
            <Chip k={0} label="Product" />
            <Chip k={1} label="Volume" />
            <Chip k={2} label="Location" />
          </div>
        </div>
        <div className={s.composer}>
          <span />
          <i />
        </div>
      </div>

      <div className={s.board}>
        <div className={s.lane}>
          <span className={s.laneName}>Answered</span>
          <div className={s.answered}>
            <span className={s.ticket} />
            <span className={s.ticket} />
            <span className={s.ticket} />
            <span className={`${s.ticket} ${s.newTicket}`} />
          </div>
        </div>
        <div className={s.lane}>
          <span className={s.laneName}>Sales-ready</span>
          <div className={s.ready}>
            <span className={`${s.lead} ${s.oldLead}`}>
              <span className={s.bars} />
            </span>
            <span className={`${s.lead} ${s.newLead}`}>
              <span className={s.bars} />
              <span className={s.leadChips}>
                <span>Product</span>
                <span>Volume</span>
                <span>Location</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className={s.tag}>
        <CountUp value="85%" at={7} className={s.value} duration={1500} />
        <span className={s.caption}>conversations automated</span>
      </div>
    </Scene>
  );
}

function Chip({ k, label }: { k: number; label: string }) {
  return (
    <span className={s.chip} style={{ "--k": k } as CSSProperties}>
      <span className={s.check} />
      {label}
    </span>
  );
}
