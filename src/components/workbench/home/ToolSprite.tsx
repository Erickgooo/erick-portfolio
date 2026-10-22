"use client";

// Workbench: the tool logos, drawn once as SVG symbols that every tile of the
// tool wall reuses with <use>. Loaded on demand by ToolLogos.
import type { IconType } from "react-icons";
import {
  SiClaude,
  SiDavinciresolve,
  SiElevenlabs,
  SiFacebook,
  SiGoogleanalytics,
  SiGooglegemini,
  SiGooglesearchconsole,
  SiInstagram,
  SiMeta,
  SiNetlify,
  SiNextdotjs,
  SiShopify,
  SiWhatsapp,
} from "react-icons/si";
import { TbBrandOpenai } from "react-icons/tb";
import type { ToolIcon } from "../data";

const ICONS: Record<ToolIcon, IconType> = {
  whatsapp: SiWhatsapp,
  openai: TbBrandOpenai,
  gemini: SiGooglegemini,
  claude: SiClaude,
  elevenlabs: SiElevenlabs,
  meta: SiMeta,
  instagram: SiInstagram,
  facebook: SiFacebook,
  analytics: SiGoogleanalytics,
  searchconsole: SiGooglesearchconsole,
  shopify: SiShopify,
  davinci: SiDavinciresolve,
  nextjs: SiNextdotjs,
  netlify: SiNetlify,
};

// Zero-sized rather than display: none, so <use> can still render the symbols.
const HIDDEN = { position: "absolute", width: 0, height: 0, overflow: "hidden" } as const;

export function ToolSprite() {
  return (
    <svg style={HIDDEN} aria-hidden="true" focusable="false">
      <defs>
        {Object.entries(ICONS).map(([key, Icon]) => (
          <symbol key={key} id={`tool-${key}`} viewBox="0 0 24 24">
            <Icon size="100%" />
          </symbol>
        ))}
      </defs>
    </svg>
  );
}
