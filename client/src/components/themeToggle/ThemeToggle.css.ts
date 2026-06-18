import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const button = style({
  fontSize: "1.5rem",
  color: globalThemeContract.color.onAccent,
  backgroundColor: globalThemeContract.backgroundColor.accent,
  padding: "0.5rem",
  borderWidth: 1,
  borderColor: globalThemeContract.border.element,
  borderRadius: "0.5rem",
});

export const icon = style({
  height: "1.25rem",
});
