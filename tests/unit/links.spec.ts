import { expect, test } from "@playwright/test";
import { NEW_TAB, newTabIfExternal } from "../../src/utils/links";

test("a link that leaves the site opens in a new tab with no opener", () => {
  expect(NEW_TAB).toEqual({ target: "_blank", rel: "noopener noreferrer" });
  for (const href of [
    "https://github.com/Erickgooo",
    "http://example.com/",
    "HTTPS://www.linkedin.com/in/erick-mahecha/",
    "https://twitter.com/intent/tweet?url=https%3A%2F%2Ferickmahecha.com%2Fblog",
  ]) {
    expect(newTabIfExternal(href), href).toEqual(NEW_TAB);
  }
});

test("a path, an anchor, a mailto and a download stay in the tab", () => {
  for (const href of [
    "/about",
    "#stack",
    "mailto:?subject=A%20post&body=https%3A%2F%2Ferickmahecha.com",
    "/resume/Erick_Mahecha_Resume.pdf",
    "",
  ]) {
    expect(newTabIfExternal(href), href).toEqual({});
  }
});
