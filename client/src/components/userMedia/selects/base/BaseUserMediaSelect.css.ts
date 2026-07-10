import { style } from "@vanilla-extract/css";

export const trigger = style({
  width: "100%",
  maxWidth: "16rem",

  selectors: {
    "&[data-disabled]": {
      opacity: 0.5,
    },
  },
});
