// The part of the theme the server needs: the localStorage key of the
// visitor's choice and the inline script that applies the theme before the
// first paint (the saved choice, or else the system's). The hook that follows
// and changes the theme afterwards is in ./theme.ts.

export const THEME_KEY = "data-theme";

export const THEME_INIT = `(function () {
  var theme;
  try {
    theme = localStorage.getItem("${THEME_KEY}");
  } catch (e) {}
  if (theme !== "light" && theme !== "dark") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();`;
