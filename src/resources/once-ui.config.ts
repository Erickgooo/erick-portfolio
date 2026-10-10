import type {
  DataStyleConfig,
  DisplayConfig,
  EffectsConfig,
  FontsConfig,
  MailchimpConfig,
  RoutesConfig,
  SameAsConfig,
  SchemaConfig,
  SocialSharingConfig,
  StyleConfig,
} from "@/types";
import { home, person, social } from "./index";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL: string = "https://erickmahecha.com";

const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/gallery": true,
};

const display: DisplayConfig = {
  location: true,
  time: true,
  themeSwitcher: true,
};

// Enable password protection on selected routes
// Set password in the .env file, refer to .env.example
// Defined in ./protectedRoutes so middleware.ts can import it standalone.
import { protectedRoutes } from "./protectedRoutes";

// Font instances live in src/app/fonts.ts (Task 11b — see that file for
// the preload details). Re-exported here for API compatibility; this
// barrel (@/resources) is imported by client components (e.g.
// src/components/Header.tsx), so these font instances are not
// server-only despite living under src/app.
import { body, code, heading } from "@/app/fonts";

const fonts: FontsConfig = {
  heading,
  body,
  label: body,
  code,
};

// default customization applied to the HTML in the main layout.tsx
const style: StyleConfig = {
  theme: "system", // dark | light | system
  neutral: "custom", // sand | gray | slate | custom — Obsidiana/Titanio/Grafito (src/resources/custom.css)
  brand: "custom", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom — Cobalto Eléctrico
  accent: "custom", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom — Cobalto Eléctrico
  solid: "color", // color | contrast — solid surfaces must carry Cobalto Eléctrico, not a neutral (Manual §3.2: CTAs exclusivamente en Cobalto)
  solidStyle: "flat", // flat | plastic
  border: "conservative", // rounded | playful | conservative — Manual §2.3: geometría angular, sin redondeos decorativos
  surface: "filled", // filled | translucent — filled has no backdrop blur
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const dataStyle: DataStyleConfig = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

const effects: EffectsConfig = {
  mask: {
    cursor: true,
    x: 50,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: false,
    opacity: 100,
    x: 50,
    y: 60,
    width: 100,
    height: 50,
    tilt: 0,
    colorStart: "accent-background-strong",
    colorEnd: "page-background",
  },
  dots: {
    display: true,
    opacity: 40,
    size: "2",
    color: "brand-background-strong",
  },
  grid: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-medium",
    width: "0.25rem",
    height: "0.25rem",
  },
  lines: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-weak",
    size: "16",
    thickness: 1,
    angle: 45,
  },
};

const mailchimp: MailchimpConfig = {
  action: "https://url/subscribe/post?parameters",
  effects: {
    mask: {
      cursor: true,
      x: 50,
      y: 0,
      radius: 100,
    },
    gradient: {
      display: true,
      opacity: 90,
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      tilt: 0,
      colorStart: "accent-background-strong",
      colorEnd: "static-transparent",
    },
    dots: {
      display: true,
      opacity: 20,
      size: "2",
      color: "brand-on-background-weak",
    },
    grid: {
      display: false,
      opacity: 100,
      color: "neutral-alpha-medium",
      width: "0.25rem",
      height: "0.25rem",
    },
    lines: {
      display: false,
      opacity: 100,
      color: "neutral-alpha-medium",
      size: "16",
      thickness: 1,
      angle: 90,
    },
  },
};

// default schema data
const schema: SchemaConfig = {
  logo: `${baseURL}/favicon.ico`,
  type: "Person",
  name: person.name,
  description: home.description,
  email: person.email,
};

// Profile URLs for schema.org `sameAs`, derived from the social links so the two
// never drift apart. mailto: entries are excluded — sameAs takes URLs only.
const sameAs: SameAsConfig = social
  .map((item) => item.link)
  .filter((link) => link.startsWith("http"));

// social sharing configuration for blog posts
const socialSharing: SocialSharingConfig = {
  display: true,
  platforms: {
    x: true,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: false,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

export {
  display,
  mailchimp,
  routes,
  protectedRoutes,
  baseURL,
  fonts,
  style,
  schema,
  sameAs,
  socialSharing,
  effects,
  dataStyle,
};
