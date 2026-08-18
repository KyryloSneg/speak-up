import { globalStyle, style, type StyleRule } from "@vanilla-extract/css";

const xsButtonStyle: StyleRule = {
  width: "1.625rem",
  height: "1.625rem",
} as const;

const xsIconStyle: StyleRule = {
  width: "0.8125rem",
  height: "0.8125rem",
} as const;

const smButtonStyle: StyleRule = {
  width: "2rem",
  height: "2rem",
} as const;

const smIconStyle: StyleRule = {
  width: "1rem",
  height: "1rem",
} as const;

export const smElemOverlaySelector =
  '[data-slot="overlay-item-list"]:has(> li:nth-child(n+4))';

export const xsButtonBreakpoint = "(max-width: 14rem)";
export const smButtonBreakpoint = "(max-width: 16.25rem)";

export const button = style({
  selectors: {
    [`${smElemOverlaySelector} &`]: {
      "@container": {
        [xsButtonBreakpoint]: xsButtonStyle,
      },
    },
  },
  "@container": {
    [smButtonBreakpoint]: smButtonStyle,
  },
});

globalStyle(`.${button} svg:not([class*='size-'])`, {
  "@container": {
    [smButtonBreakpoint]: smIconStyle,
  },
});

globalStyle(`${smElemOverlaySelector} .${button} svg:not([class*='size-'])`, {
  "@container": {
    [xsButtonBreakpoint]: xsIconStyle,
  },
});
