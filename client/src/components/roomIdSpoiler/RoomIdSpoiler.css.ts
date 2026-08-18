import { globalThemeContract } from "@/styles/theme.css";
import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import { keyframes, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const spoilerShimmer = keyframes({
  "0%": { backgroundPosition: "0% 0%" },
  "100%": { backgroundPosition: "100% 100%" },
});

export const wrapper = style({
  display: "flex",
  alignItems: "stretch",
  gap: "1rem",
});

export const dl = style({
  display: "flex",
  alignItems: "stretch",
  gap: "0.625rem",
  whiteSpace: "nowrap",
});

export const dt = style({
  height: "max-content",
  margin: "auto 0",
});

export const dd = recipe({
  base: {
    position: "relative",
    color: globalThemeContract.color.primary,
    display: "inline-flex",
    alignItems: "center",
    width: "max-content",
    padding: "0 0.375rem",
    borderRadius: "calc(var(--radius) * 0.5)",
    transition: formatCommaSeparatedCss(`
      color var(--default-transition-duration) ease,
      background-color var(--default-transition-duration) ease
    `),
    whiteSpace: "nowrap",
  },

  variants: {
    visibility: {
      hidden: {
        color: "transparent",
        overflow: "hidden",
        backgroundColor: globalThemeContract.backgroundColor.tertiary,

        "::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "6rem 6rem",
          opacity: 0.25,
          animation: `${spoilerShimmer} 0.6s steps(4) infinite`,
        },
      },
      visible: {
        color: globalThemeContract.color.primary,
        backgroundColor: "transparent",
      },
    },
  },
  defaultVariants: { visibility: "hidden" },
});

export const buttonGroup = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
});

export const revealButton = style({
  minWidth: "4.375rem",
});

export const copyButton = recipe({
  variants: {
    state: {
      idle: {},
      copied: {
        color: globalThemeContract.color.accent,
      },
    },
  },
  defaultVariants: { state: "idle" },
});
