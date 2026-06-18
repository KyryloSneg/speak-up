import { style } from "@vanilla-extract/css";

export const section = style({
  width: "calc(100% - 1.75rem)",
  height: "max-content",
  maxWidth: "28rem",
  alignSelf: "center",
  justifySelf: "center",
});

export const header = style({
  "@media": {
    "screen and (max-width: 26.25rem)": {
      gap: "1rem",
      gridTemplateColumns: "1fr",
    },
  },
});

export const title = style({
  "@media": {
    "screen and (max-width: 26.25rem)": {
      textAlign: "center",
    },
  },
});

export const action = style({
  "@media": {
    "screen and (max-width: 26.25rem)": {
      gridColumn: "auto",
      gridRow: "auto",
      justifySelf: "center",
    },
  },
});

export const link = style({
  whiteSpace: "normal",
});

export const submit = style({
  width: "100%",
});
