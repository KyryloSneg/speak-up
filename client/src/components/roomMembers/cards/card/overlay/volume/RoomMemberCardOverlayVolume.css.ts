import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const dl = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.25rem",
  marginBottom: "0.5rem",
});

export const dt = style({});

export const dd = style({
  textAlign: "start",
  display: "inline-block",
  minWidth: "1.875rem",
  color: globalThemeContract.color.secondary,
});
