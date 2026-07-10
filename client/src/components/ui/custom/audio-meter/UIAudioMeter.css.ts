import type { RecipeVariantsProps } from "@/styles/recipe";
import { globalThemeContract } from "@/styles/theme.css";
import { createVar, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const volumeColor = createVar();
export const root = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity",
    transitionDuration: "var(--default-transition-duration)",

    selectors: {
      "&[data-disabled='true'], &[aria-disabled='true']": {
        opacity: 0.5,
      },
    },
  },
  variants: {
    color: {
      default: {},
      contrast: {},
    },
  },
  defaultVariants: { color: "default" },
});

export const barContainer = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.5rem",
    borderRadius: "0.75rem",
    border: `1px solid ${globalThemeContract.border.subtle}`,
  },
  variants: {
    color: {
      default: {
        backgroundColor: globalThemeContract.backgroundColor.secondary,
      },
      contrast: {
        backgroundColor: globalThemeContract.color.secondary,
      },
    },
  },
  defaultVariants: { color: "default" },
});

export const barSegment = recipe({
  base: {
    height: "1rem",
    width: "0.625rem",
    borderRadius: "0.1875rem",
    transition: "all 75ms ease-out",
  },
  variants: {
    color: {
      default: {
        backgroundColor: globalThemeContract.backgroundColor.tertiary,
      },
      contrast: {
        backgroundColor: globalThemeContract.color.tertiary,
      },
    },
  },
  defaultVariants: { color: "default" },
});

export const barSegmentActive = style({
  backgroundColor: volumeColor,
});

export const circleRingContainer = style({
  position: "relative",
  width: "1.75rem",
  height: "1.75rem",
});

export const circleRingSvg = style({
  width: "100%",
  height: "100%",
  transform: "rotate(-90deg)",
});

export const circleRingTrack = recipe({
  variants: {
    color: {
      default: {
        stroke: globalThemeContract.backgroundColor.tertiary,
      },
      contrast: {
        stroke: globalThemeContract.color.tertiary,
      },
    },
  },
  defaultVariants: { color: "default" },
});

export const circleRingIndicator = style({
  stroke: volumeColor,
  transition: "stroke-dashoffset 75ms ease-out",
});

export const circleRingCenter = recipe({
  base: {
    position: "absolute",
    inset: "0.375rem",
    borderRadius: "9999px",
    transition: "background-color 150ms ease",
  },
  variants: {
    color: {
      default: {
        backgroundColor: globalThemeContract.backgroundColor.tertiary,
      },
      contrast: {
        backgroundColor: globalThemeContract.color.tertiary,
      },
    },
  },
  defaultVariants: { color: "default" },
});

export const circleRingCenterActive = style({
  backgroundColor: volumeColor,
});

export type RootVariants = RecipeVariantsProps<typeof root>;
