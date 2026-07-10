import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const message = style({
  position: "absolute",
  left: "50%",
  bottom: "25%",
  transform: "translate(-50%, 0)",
  backgroundColor: globalThemeContract.backgroundColor.primary,
  textAlign: "center",
  fontSize: "1.375rem",
  width: "max-content",
  padding: "0.25rem 0.75rem",
  marginInline: "auto",
  borderWidth: "2px",
  borderRadius: "var(--radius)",
  pointerEvents: "none",

  "@media": {
    ["screen and (min-width: 30rem)"]: {
      position: "static",
      transform: "none",
      fontSize: "1.75rem",
      padding: "0.375rem 1rem",
    },
  },
});
