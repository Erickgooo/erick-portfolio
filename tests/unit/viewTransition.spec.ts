import { expect, test } from "@playwright/test";
import { shouldIntercept, vtNameForPath } from "@/components/motion/viewTransition";

const base = {
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
  target: null as string | null,
  download: false,
  current: { origin: "https://erickmahecha.com", pathname: "/", search: "" },
};

test("intercepts plain internal navigations", () => {
  expect(shouldIntercept({ ...base, href: "/work" })).toEqual({ href: "/work", pathname: "/work" });
  expect(shouldIntercept({ ...base, href: "/work/leadbot-ai#results" })).toEqual({
    href: "/work/leadbot-ai#results",
    pathname: "/work/leadbot-ai",
  });
});

test("ignores modified clicks, non-primary buttons, targets and downloads", () => {
  expect(shouldIntercept({ ...base, href: "/work", metaKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", ctrlKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", shiftKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", altKey: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", button: 1 })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", target: "_blank" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/resume/cv.pdf", download: true })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/work", defaultPrevented: true })).toBeNull();
});

test("ignores external, same-page hash, API and file links", () => {
  expect(shouldIntercept({ ...base, href: "https://linkedin.com/in/x" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "mailto:a@b.co" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "#top" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/api/rss" })).toBeNull();
  expect(shouldIntercept({ ...base, href: "/resume/Erick_Mahecha_Resume.pdf" })).toBeNull();
  expect(shouldIntercept({ ...base, href: null })).toBeNull();
});

test("maps case-study paths to a unique shared-element name", () => {
  expect(vtNameForPath("/work/leadbot-ai")).toBe("project-leadbot-ai");
  expect(vtNameForPath("/work")).toBeNull();
  expect(vtNameForPath("/blog/my-workspace")).toBeNull();
});
