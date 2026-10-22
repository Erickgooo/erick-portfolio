// Workbench: the tool wall, the dark band of the page. On desktop the section
// pins and scrolling advances through four groups; the tiles of each group
// light up one by one (an icon grid, after foundable's). On phones nothing
// pins: each group stacks with its own tiles, which light up as they enter.
// Each tool appears three times in the markup (its list tile and the two
// faces of its board cell), so every logo is drawn once, as a symbol that the
// tiles reuse with <use>; the symbols load when the wall nears (ToolLogos).
import type { CSSProperties } from "react";
import { TOOL_GROUPS, type Tool, WALL_ORDER } from "../data";
import { ToolLogos } from "./ToolLogos";
import { WallController } from "./WallController";
import styles from "./toolwall.module.scss";

function TileFace({ tool }: { tool: Tool }) {
  return (
    <>
      <span className={styles.glyph} aria-hidden="true">
        {tool.icon ? (
          <svg className={styles.logo} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <use href={`#tool-${tool.icon}`} />
          </svg>
        ) : (
          <span className={styles.mono}>{tool.mono}</span>
        )}
      </span>
      <span className={styles.name}>{tool.name}</span>
    </>
  );
}

export function ToolWall() {
  return (
    <section className={styles.wall} aria-labelledby="tools-title" data-active="-1">
      <ToolLogos />
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
                  <li
                    key={group.id}
                    className={styles.group}
                    data-g={g}
                  >
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
