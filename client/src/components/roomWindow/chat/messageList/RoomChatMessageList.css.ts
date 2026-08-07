import { globalThemeContract } from "@/styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const root = style({
  position: "relative",
  // text gets messed up during scrolling without this will-change
  // (in UIDialog)
  willChange: "opacity",
});

export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

export const noMessages = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.375rem",
  width: "100%",
  textAlign: "center",
  fontSize: "1.375rem",
  color: globalThemeContract.color.muted,
});

globalStyle(`div:has(> ${noMessages})`, {
  position: "relative",
  top: "12.5%",
  insetInline: 0,
});
