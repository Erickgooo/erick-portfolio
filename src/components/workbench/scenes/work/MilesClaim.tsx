// Scene (type 1): the Samsung × LifeMiles claim on WhatsApp, led at Incentiva
// Group. A phone purchase comes in; on a generic phone, drawn here, the buyer
// sends the invoice photo and the IMEI; the invoice is read by OCR; a first
// IMEI fails the Luhn check and is rejected, the corrected one passes; a
// second model verifies the identity document; the miles are credited and
// the campaign's total comes up.
//
// Facts: src/app/work/projects/samsung-lifemiles-whatsapp.mdx (OCR invoice
// validation, deterministic IMEI validation with the Luhn check, a second
// independent model for identity documents, "2M+ LifeMiles miles awarded
// through the chatbot"). The
// IMEIs are the textbook example number, not a buyer's: 49 015420 323751 8
// passes the Luhn check, and the same digits ending in 3 fail it. Brands in
// text only: no logo, no product image, no real chat interface. Portrait (4:5).
import type { CSSProperties } from "react";
import { CountUp, Scene } from "../Scene";
import s from "./milesclaim.module.scss";

const CHECKS = [
  { key: "ocr", label: "Invoice read by OCR", note: "purchase and date found", ok: true },
  {
    key: "bad",
    label: "IMEI 49 015420 323751 3",
    note: "fails the Luhn check, rejected",
    ok: false,
  },
  { key: "good", label: "IMEI 49 015420 323751 8", note: "Luhn check passed", ok: true },
  { key: "id", label: "Identity document", note: "verified by a second model", ok: true },
];

export function MilesClaim() {
  return (
    <Scene className={s.scene} steps={[900, 1300, 2400, 1300, 4400]} loop>
      <div className={s.purchase}>
        <span className={s.label}>Galaxy S26 purchase</span>
        <span className={s.chip}>LifeMiles promotion</span>
      </div>

      <div className={s.phone}>
        <span className={s.notch} />
        <span className={`${s.bubble} ${s.me}`}>
          <span className={s.photo}>
            <i />
            <i />
            <i />
          </span>
          Invoice photo
        </span>
        <span className={`${s.bubble} ${s.me} ${s.imei}`}>IMEI 49 015420 323751 3</span>
        <span className={`${s.bubble} ${s.me} ${s.imei} ${s.retry}`}>IMEI 49 015420 323751 8</span>
      </div>

      <ol className={s.checks}>
        {CHECKS.map((c, k) => (
          <li
            key={c.key}
            className={c.ok ? s.check : `${s.check} ${s.fail}`}
            style={{ "--k": k } as CSSProperties}
          >
            <i className={c.ok ? s.tick : s.cross} />
            <span>
              <span className={s.checkLabel}>{c.label}</span>
              <span className={s.note}>{c.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className={s.result}>
        <CountUp value="2M+" at={4} className={s.value} duration={1500} />
        <span className={s.caption}>
          LifeMiles miles awarded through the chatbot
          <span className={s.note}>credited once every check passes</span>
        </span>
      </div>
    </Scene>
  );
}
