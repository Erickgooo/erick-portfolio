// Workbench: the tool wall, the dark band of the page. On desktop the section
// pins and scrolling advances through four groups; the tiles of each group
// light up one by one (an icon grid, after foundable's). On phones nothing
// pins: each group stacks with its own tiles, which light up as they enter.
// Each tool shows its official logo (./tools), lazy in the markup since the
// wall sits below the fold, and fetched ahead by WallController once the page
// has loaded; its three appearances in the markup (the list tile and the two
// faces of its board cell) share one file.
// The files are imported, so the build serves them from /_next/static/media
// with a content hash and a year-long cache (public/ files are revalidated
// on every visit). The imports live here, not in ../data, because Next also
// ships an imported image's details to the browser on every route whose
// server components import that module, and only the Home shows the wall.
import type { StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import { TOOL_GROUPS, type Tool, WALL_ORDER } from "../data";
import { WallController } from "./WallController";
import bitrix24 from "./tools/bitrix24.svg";
import botsl from "./tools/botsl.png";
import capcut from "./tools/capcut.svg";
import claude from "./tools/claude.svg";
import davinciResolve from "./tools/davinci-resolve.png";
import elevenlabs from "./tools/elevenlabs.svg";
import facebook from "./tools/facebook.png";
import gemini from "./tools/gemini.svg";
import googleAnalytics from "./tools/google-analytics.svg";
import higgsfield from "./tools/higgsfield.svg";
import holo from "./tools/holo.png";
import instagram from "./tools/instagram.png";
import kling from "./tools/kling.svg";
import kommo from "./tools/kommo.png";
import meta from "./tools/meta.svg";
import netlify from "./tools/netlify.svg";
import nextjs from "./tools/nextjs.svg";
import odoo from "./tools/odoo.svg";
import openai from "./tools/openai.svg";
import searchConsole from "./tools/search-console.svg";
import shopify from "./tools/shopify.svg";
import soro from "./tools/soro.svg";
import whatsapp from "./tools/whatsapp.svg";
import zapier from "./tools/zapier.svg";
import styles from "./toolwall.module.scss";

/** The file each Tool.logo names. */
const LOGOS: Record<string, StaticImageData> = {
  "bitrix24.svg": bitrix24,
  "botsl.png": botsl,
  "capcut.svg": capcut,
  "claude.svg": claude,
  "davinci-resolve.png": davinciResolve,
  "elevenlabs.svg": elevenlabs,
  "facebook.png": facebook,
  "gemini.svg": gemini,
  "google-analytics.svg": googleAnalytics,
  "higgsfield.svg": higgsfield,
  "holo.png": holo,
  "instagram.png": instagram,
  "kling.svg": kling,
  "kommo.png": kommo,
  "meta.svg": meta,
  "netlify.svg": netlify,
  "nextjs.svg": nextjs,
  "odoo.svg": odoo,
  "openai.svg": openai,
  "search-console.svg": searchConsole,
  "shopify.svg": shopify,
  "soro.svg": soro,
  "whatsapp.svg": whatsapp,
  "zapier.svg": zapier,
};

function TileFace({ tool }: { tool: Tool }) {
  return (
    <>
      <span className={styles.glyph} aria-hidden="true">
        <img
          className={styles.logo}
          src={LOGOS[tool.logo].src}
          alt=""
          height={28}
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className={styles.name}>{tool.name}</span>
    </>
  );
}

export function ToolWall() {
  return (
    <section className={styles.wall} aria-labelledby="tools-title" data-active="-1">
      <WallController />
      <div className={styles.track} data-track="">
        <div className={styles.sticky}>
          <div className={styles.inner}>
            <div className={styles.side}>
              <h2 id="tools-title" className={styles.title} data-reveal="">
                What&rsquo;s on the bench
              </h2>
              <p className={styles.lede} data-reveal="" style={{ "--i": 1 } as CSSProperties}>
                Tools I have shipped real work with, sorted by the job they do.
              </p>
              <ul className={styles.groups}>
                {TOOL_GROUPS.map((group, g) => (
                  <li key={group.id} className={styles.group} data-g={g}>
                    <h3 className={styles.groupTitle}>
                      <span className={styles.swatch} aria-hidden="true" />
                      {group.title}
                    </h3>
                    <p className={styles.line}>{group.line}</p>
                    <ul className={styles.tiles}>
                      {group.tools.map((tool, k) => (
                        <li
                          key={tool.name}
                          className={styles.tile}
                          data-reveal=""
                          style={{ "--i": k } as CSSProperties}
                        >
                          <TileFace tool={tool} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.board} aria-hidden="true">
              {WALL_ORDER.map(([g, k]) => {
                const group = TOOL_GROUPS[g];
                const tool = group.tools[k];
                return (
                  <span
                    key={tool.name}
                    className={styles.cell}
                    data-g={g}
                    style={{ "--k": k } as CSSProperties}
                  >
                    <span className={styles.face}>
                      <TileFace tool={tool} />
                    </span>
                    <span className={`${styles.face} ${styles.hot}`}>
                      <TileFace tool={tool} />
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
