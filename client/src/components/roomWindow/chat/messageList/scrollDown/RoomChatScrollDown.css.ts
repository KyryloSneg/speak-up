import { globalThemeContract } from "@/styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";
import { nanoid } from "nanoid";

export const transitionName = `fade-${nanoid()}`;
export const alertTransitionName = `alert-fade-${nanoid()}`;

const distanceToTheSides = "1rem";
export const button = style({
  position: "absolute",
  right: distanceToTheSides,
  bottom: distanceToTheSides,
  zIndex: 1,
  borderRadius: "50%",
});

const alertSize = "1.5rem";
export const alert = style({
  position: "absolute",
  top: `calc(${alertSize} * -0.35)`,
  right: `calc(${alertSize} * -0.35)`,
  display: "block",
  aspectRatio: 1,
  width: alertSize,
  height: alertSize,
  padding: "0.25rem",
  borderWidth: 1,
  borderColor: globalThemeContract.border.subtle,
  borderRadius: "50%",
  color: globalThemeContract.color.secondary,
  backgroundColor: globalThemeContract.backgroundColor.secondary,
});

globalStyle(`${alert} svg`, {
  width: "auto !important",
  height: "auto !important",
});

const transitionConfig = "var(--default-transition-duration) ease";

[transitionName, alertTransitionName].forEach(name => {
  globalStyle(`.${name}-enter-active, .${name}-leave-active`, {
    transition: `opacity ${transitionConfig}`,
  });

  globalStyle(`.${name}-enter-from, .${name}-leave-to`, {
    opacity: 0,
  });

  globalStyle(`.${name}-enter-to, .${name}-leave-from`, {
    opacity: 1,
  });
});
