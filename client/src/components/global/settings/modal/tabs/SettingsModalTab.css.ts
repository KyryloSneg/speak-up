import { style } from "@vanilla-extract/css";

export const tabs = style({
  gap: "3rem",

  selectors: {
    "&[data-orientation='horizontal']": {
      alignItems: "center",
    },
  },
});

export const list = style({
  width: "max-content",
  height: "max-content",
});

export const content = style({
  width: "100%",
});
