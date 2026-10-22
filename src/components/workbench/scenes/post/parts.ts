// The post "My Workspace": which part of the drawn desk (DeskScene) each of
// its sections is about, matched by the section's heading. Plain data, safe
// for client components (PostIndex reads it while the visitor reads).

export type DeskPart = "intro" | "machine" | "av" | "room" | "notion" | "all";

export const DESK_POST = "my-workspace";

export function deskPartOf(heading: string): DeskPart {
  if (/machine/i.test(heading)) return "machine";
  if (/audio|video/i.test(heading)) return "av";
  if (/physical|environment/i.test(heading)) return "room";
  if (/notion/i.test(heading)) return "notion";
  if (/bigger picture/i.test(heading)) return "all";
  return "intro";
}
