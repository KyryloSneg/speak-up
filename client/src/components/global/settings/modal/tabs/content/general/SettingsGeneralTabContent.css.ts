import { style } from "@vanilla-extract/css";

export const rootSection = style({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
});

// children styles
export const section = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.25rem",
});

export const heading = style({
  fontSize: "1.25rem",
});
