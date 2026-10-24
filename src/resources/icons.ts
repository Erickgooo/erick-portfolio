// The icons of Erick's profile links and of the resume link.
import type { IconType } from "react-icons";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { HiEnvelope, HiOutlineDocument } from "react-icons/hi2";

export const icons = {
  github: FaGithub,
  linkedin: FaLinkedin,
  email: HiEnvelope,
  document: HiOutlineDocument,
} satisfies Record<string, IconType>;

export type IconName = keyof typeof icons;
