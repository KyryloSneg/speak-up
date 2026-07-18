import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
});

export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const noMessages = style({
  position: "absolute",
  top: "25%",
  left: "50%",
  transform: "translate(-50%, -25%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.375rem",
  width: "100%",
  textAlign: "center",
  fontSize: "1.375rem",
  color: globalThemeContract.color.muted,
});
