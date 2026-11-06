import { type Post, byNewest } from "@/utils/posts";
import { expect, test } from "@playwright/test";

const post = (slug: string, publishedAt: string) =>
  ({ slug, metadata: { publishedAt }, content: "" }) as Post;

test("byNewest puts the latest date first and keeps the order of equal dates", () => {
  const posts = [
    post("old", "2024-01-05"),
    post("new", "2026-11-02"),
    post("same-a", "2025-06-01"),
    post("same-b", "2025-06-01"),
  ];
  expect([...posts].sort(byNewest).map((p) => p.slug)).toEqual(["new", "same-a", "same-b", "old"]);
});
