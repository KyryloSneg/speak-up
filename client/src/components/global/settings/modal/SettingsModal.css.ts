import { style } from "@vanilla-extract/css";

export const content = style({
  display: "grid",
  gridTemplateRows: "auto 1fr",
  width: "100%",
  height: "max-content",
  maxWidth: "min(45rem, calc(100vw - 2rem))",
  minHeight: "19rem",

  selectors: {
    "[data-slot='drawer-content'] &": {
      maxWidth: "none",
      minHeight: "27rem",
    },
  },
});

export const header = style({
  marginBottom: "1rem",
});

export const title = style({
  selectors: {
    "[data-slot='drawer-content'] &": {
      textAlign: "center",
    },
  },
});
