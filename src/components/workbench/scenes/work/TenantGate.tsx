// Scene (type 1): Scope's fail-closed tenant isolation. A signed token reaches
// the campaign resolver, which reads the campaign from the token and opens
// that client's own database; a request for the other client's data is
// refused; then the days to the second client count up.
//
// Facts: src/app/work/projects/scope-multi-client-platform.mdx ("one database
// per client", "a campaign-resolution layer that picks the database from the
// signed token and fails closed", "11 days", "146 checks passed and 0
// failures"). The clients are placeholders ("Client A", "Client B"): no real
// campaign, screen or data. Portrait (4:5) only.
import { CountUp, Scene } from "../Scene";
import s from "./tenantgate.module.scss";

function Db() {
  return (
    <svg className={s.dbIcon} viewBox="0 0 24 28" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="10" ry="4" />
      <path d="M2 5v18c0 2.2 4.5 4 10 4s10-1.8 10-4V5" />
      <path d="M2 11c0 2.2 4.5 4 10 4s10-1.8 10-4M2 17c0 2.2 4.5 4 10 4s10-1.8 10-4" />
    </svg>
  );
}

export function TenantGate() {
  return (
    <Scene className={s.scene} steps={[900, 1100, 1500, 2400, 4400]} loop>
      <div className={s.token}>
        <span className={s.tokenHead}>
          <span className={s.label}>Signed token</span>
          <span className={s.signed}>
            <i className={s.tick} />
            signed
          </span>
        </span>
        <span className={s.row}>
          <span className={s.key}>Campaign</span>
          <span className={s.val}>Client A</span>
        </span>
        <span className={s.row}>
          <span className={s.key}>Role</span>
          <span className={s.val}>Coordinator</span>
        </span>
      </div>

      <i className={`${s.line} ${s.lineIn}`} />

      <div className={s.gate}>
        <span className={s.label}>Campaign resolver</span>
        <span className={s.note}>reads the campaign from the token</span>
      </div>

      <i className={`${s.line} ${s.lineA}`} />
      <i className={`${s.line} ${s.lineB}`} />

      <div className={s.refused}>
        <i className={s.cross} />
        <span>
          Request for Client B<span className={s.note}>refused, fails closed</span>
        </span>
      </div>

      <div className={`${s.db} ${s.dbA}`}>
        <Db />
        <span className={s.label}>Client A</span>
        <span className={s.note}>own database</span>
        <span className={s.opened}>
          <i className={s.tick} />
          opened
        </span>
      </div>
      <div className={`${s.db} ${s.dbB}`}>
        <Db />
        <span className={s.label}>Client B</span>
        <span className={s.note}>own database</span>
      </div>

      <div className={s.result}>
        <CountUp value="11 days" at={4} className={s.value} duration={1300} />
        <span className={s.caption}>
          to a second client live
          <span className={s.note}>146 checks passed, 0 failures</span>
        </span>
      </div>
    </Scene>
  );
}
