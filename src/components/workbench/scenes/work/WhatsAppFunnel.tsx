// Scene (type 1): the DIRECTV click-to-WhatsApp funnel. An ad opens a chat
// with a pre-filled message; the assistant asks for consent before it takes
// any detail; the lead is checked (coverage, plan, consent) and a qualified-
// lead event goes back to Meta; a human advisor takes the conversation.
//
// Facts: src/app/work/projects/directv-click-to-whatsapp.mdx (pre-filled
// messages, "lead data captured only after explicit consent", coverage by
// municipality, "QualifiedLead" to the Meta Conversions API, "hands off to a
// human closer"). The ad and the chat are generic and drawn: no brand, price,
// phone number or messaging-app interface. Portrait (4:5) only.
import type { CSSProperties } from "react";
import { Scene, Typed, typeTime } from "../Scene";
import s from "./whatsappfunnel.module.scss";

const ASK = "Hi! Which plans can I get at my address?";
const CHECKS = ["Coverage", "Plan", "Consent"];

export function WhatsAppFunnel() {
  return (
    <Scene className={s.scene} steps={[900, typeTime(ASK) + 500, 1500, 1700, 4400]} loop>
      <div className={s.ad}>
        <span className={s.adArt} />
        <span className={s.adText}>
          <span className={s.label}>Sponsored</span>
          <i />
          <i />
        </span>
        <span className={s.cta}>Send message</span>
      </div>

      <div className={s.chat}>
        <span className={`${s.bubble} ${s.me}`}>
          <Typed text={ASK} at={1} />
        </span>
        <span className={`${s.bubble} ${s.bot}`}>
          Before we start: may we use your details to contact you about a plan?
          <span className={s.choices}>
            <span className={s.yes}>Yes, I agree</span>
            <span>No</span>
          </span>
        </span>
      </div>

      <div className={s.qualify}>
        <span className={s.checks}>
          {CHECKS.map((c, k) => (
            <span key={c} className={s.check} style={{ "--k": k } as CSSProperties}>
              <i className={s.tick} />
              {c}
            </span>
          ))}
        </span>
        <span className={s.event}>
          QualifiedLead <span className={s.arrow} /> Meta
        </span>
      </div>

      <div className={s.handoff}>
        <span className={s.person} />
        <span>
          <span className={s.label}>Human advisor</span>
          <span className={s.note}>takes the qualified chat and closes the sale</span>
        </span>
      </div>
    </Scene>
  );
}
