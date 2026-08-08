import { globalStyle, style } from "@vanilla-extract/css";

export const content = style({
  alignSelf: "start",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  width: "100%",
  height: "max-content",
  maxWidth: "min(45rem, calc(100vw - 2rem))",

  selectors: {
    "[data-slot='drawer-content'] &": {
      maxWidth: "none",
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

globalStyle(`[data-slot='drawer-content']:has(.${content})`, {
  height: "100vh",
});
