// Who the site is about: Erick's details, and the profiles he links to (the
// footer, About and schema.org's sameAs read them).
import type { IconName } from "./icons";

export type Profile = {
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  /** The portrait, under public/. */
  avatar: string;
  email: string;
  location: string;
  /** IANA zone of the clock in the header. */
  timeZone: string;
  languages: string[];
};

export const profile: Profile = {
  firstName: "Erick Santiago",
  lastName: "Mahecha Tafur",
  name: "Erick Mahecha",
  role: "Growth Marketing & AI Automation Specialist",
  avatar: "/images/avatar.jpg",
  email: "santiagomahecha2328@gmail.com",
  location: "Medellín, Colombia",
  timeZone: "America/Bogota",
  languages: ["Spanish", "English"],
};

export type ProfileLink = { name: string; icon: IconName; href: string };

export const profileLinks: ProfileLink[] = [
  {
    name: "GitHub",
    icon: "github",
    href: "https://github.com/Erickgooo",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    href: "https://www.linkedin.com/in/erick-mahecha/",
  },
  {
    name: "Email",
    icon: "email",
    href: `mailto:${profile.email}`,
  },
];
