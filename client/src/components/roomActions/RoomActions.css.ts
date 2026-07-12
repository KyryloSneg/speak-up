import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const list = style({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  width: "max-content",
  padding: "0.625rem 1rem",
  borderWidth: "1px",
  borderColor: globalThemeContract.border.element,
  borderRadius: "var(--radius)",
  backgroundColor: globalThemeContract.backgroundColor.primary,
});
