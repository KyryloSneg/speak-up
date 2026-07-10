import { style } from "@vanilla-extract/css";

export const distanceToPreview = "1rem";
export const breakpoint = "screen and (min-width: 30rem)";

export const group = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5rem",
  width: "100%",
  position: "absolute",
  insetInline: 0,
  top: `calc(100% + ${distanceToPreview})`,

  "@media": {
    [breakpoint]: {
      position: "static",
    },
  },
});
