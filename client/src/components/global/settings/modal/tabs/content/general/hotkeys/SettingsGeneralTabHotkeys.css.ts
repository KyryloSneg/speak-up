import { style } from "@vanilla-extract/css";

export const list = style({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const listItem = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  columnGap: "1rem",
  rowGap: "0.25rem",
  fontSize: "0.875rem",

  "@media": {
    "(min-width: 26.25rem)": {
      fontSize: "1.0625rem",
    },
  },
});
