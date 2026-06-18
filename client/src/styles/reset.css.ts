import { globalLayer, globalStyle } from "@vanilla-extract/css";

export const resetLayer = globalLayer("reset");

const reset = (selector: string, styles: object) => {
  globalStyle(selector, {
    "@layer": {
      [resetLayer]: styles,
    },
  });
};

reset("*, *::before, *::after", {
  boxSizing: "border-box",
});

reset("*:not(dialog)", {
  margin: 0,
  padding: 0,
});

reset("html, body", {
  height: "100%",
});

reset("html", {
  WebkitTextSizeAdjust: "none",
  MozTextSizeAdjust: "none",
  textSizeAdjust: "none",
  textWrap: "pretty",
});

reset("body", {
  lineHeight: 1.5,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

reset("img, picture, video, canvas, svg", {
  display: "block",
  maxWidth: "100%",
});

reset("input, button, textarea, select", {
  font: "inherit",
  color: "inherit",
});

reset("button", {
  cursor: "pointer",
  background: "transparent",
  border: "none",
});

reset("p, h1, h2, h3, h4, h5, h6", {
  overflowWrap: "break-word",
});

reset("ol, ul", {
  listStyle: "none",
});

reset("html", {
  "@media": {
    "(prefers-reduced-motion: no-preference)": {
      interpolateSize: "allow-keywords",
    },
  },
});
