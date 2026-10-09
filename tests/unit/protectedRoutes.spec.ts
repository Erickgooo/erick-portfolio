import { getProtectedPaths, isProtectedPath } from "@/resources/protectedRoutes";
import { expect, test } from "@playwright/test";

const config = { "/work": true, "/blog": false } as const;

test.describe("isProtectedPath", () => {
  test("matches the route and everything below it", () => {
    expect(isProtectedPath("/work", config)).toBe(true);
    expect(isProtectedPath("/work/leadbot-ai", config)).toBe(true);
    expect(isProtectedPath("/work/", config)).toBe(true);
  });
  test("matches suffixed payload variants of the route", () => {
    expect(isProtectedPath("/work.rsc", config)).toBe(true);
    expect(isProtectedPath("/work.segments/_tree.segment.rsc", config)).toBe(true);
    expect(isProtectedPath("/work/leadbot-ai.rsc", config)).toBe(true);
  });
  test("decodes percent-encoding before comparing", () => {
    expect(isProtectedPath("/%77ork", config)).toBe(true);
    expect(isProtectedPath("/work%2Fleadbot-ai", config)).toBe(true);
    expect(isProtectedPath("/%E0%A4%A", config)).toBe(false);
  });
  test("does not match disabled or unrelated routes", () => {
    expect(isProtectedPath("/blog", config)).toBe(false);
    expect(isProtectedPath("/workshop", config)).toBe(false);
    expect(isProtectedPath("/", config)).toBe(false);
    expect(isProtectedPath("/about", config)).toBe(false);
  });
  test("protecting the root protects every path", () => {
    expect(isProtectedPath("/about", { "/": true })).toBe(true);
  });
  test("getProtectedPaths lists only enabled routes", () => {
    expect(getProtectedPaths(config)).toEqual(["/work"]);
  });
});
