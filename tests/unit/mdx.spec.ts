import { preContent } from "@/components/mdx/preContent";
import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const inPre = (children: Parameters<typeof preContent>[0]) =>
  renderToStaticMarkup(createElement("pre", null, preContent(children)));

test("a fenced block's text is taken out of the code element MDX wraps it in", () => {
  expect(preContent(createElement("code", null, "New Lead -> Closed"))).toBe("New Lead -> Closed");
});

test("a fenced block that holds elements keeps them", () => {
  const code = createElement("code", null, "A ", createElement("em", null, "then"), " B");
  expect(inPre(code)).toBe("<pre>A <em>then</em> B</pre>");
});

test("anything that is not one element with children is rendered as it is", () => {
  expect(preContent("plain")).toBe("plain");
  expect(inPre([createElement("span", { key: "a" }, "a"), "b"])).toBe("<pre><span>a</span>b</pre>");
  expect(inPre(createElement("br"))).toBe("<pre><br/></pre>");
});
