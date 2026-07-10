import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

const breakpoint = "screen and (min-width: 30rem)";
export const wrapper = style({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  gap: "1.5rem",

  "@media": {
    [breakpoint]: {
      alignItems: "center",
    },
  },
});

export const nicknameWrapper = style({
  width: "max-content",
  height: "max-content",
  maxWidth: "max(4rem, 50%)",
  padding: "0.125rem 0.375rem",
  borderRadius: "0.25rem",
  color: globalThemeContract.color.secondary,
  backgroundColor: globalThemeContract.backgroundColor.secondary,
  pointerEvents: "none",
});

export const nickname = style({
  fontSize: "1rem",

  "@media": {
    [breakpoint]: {
      fontSize: "1.375rem",
    },
  },
});
