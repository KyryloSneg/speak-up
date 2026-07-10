import { globalStyle, style } from "@vanilla-extract/css";

export const base = style({
  width: "100%",
  height: "100%",
  maxHeight: "100%",
});

export const selectPreviewWrapper = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "1.25rem",

  selectors: {
    "[data-slot='drawer-content'] &": {
      justifyContent: "center",
    },
  },
});

globalStyle(`${selectPreviewWrapper} > *:first-child`, {
  alignSelf: "start",
});
