import * as styles from "@/components/formCard/FormCard.css";
import { formCardMaxWidth } from "@/components/formCard/FormCard.css";
import { globalThemeContract } from "@/styles/theme.css";
import { appGridSpacing, pxInRem } from "@/utils/styleConsts";
import { style } from "@vanilla-extract/css";

const headingBigMobileBreakpointValueRem = 26.25;
const headingTabletBreakpointValueRem = 48;

const breakpoint = "screen and (min-width: 80rem)";

export const main = style({
  marginInline: appGridSpacing,
});

export const headingDetailsWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "3rem",
});

export const heading = style({
  textAlign: "center",

  "@media": {
    [`screen and (max-width: ${headingTabletBreakpointValueRem - pxInRem}rem)`]:
      {
        fontSize: "1.75rem",
        maxWidth: "25.625rem",
      },

    [`screen and (max-width: ${headingBigMobileBreakpointValueRem - pxInRem}rem)`]:
      {
        fontSize: "1.4375rem",
        maxWidth: "20rem",
      },
  },
});

export const headingSpan = style({
  color: globalThemeContract.color.accent,
  textDecoration: "underline",
  textUnderlineOffset: "4px",
});

export const details = style({
  color: globalThemeContract.color.tertiary,
  textAlign: "center",
  maxWidth: "20rem",
  fontSize: "1.125rem",

  "@media": {
    [`screen and (min-width: ${headingBigMobileBreakpointValueRem}rem)`]: {
      maxWidth: "22.75rem",
      fontSize: "1.25rem",
    },

    [`screen and (min-width: ${headingTabletBreakpointValueRem}rem)`]: {
      fontSize: "1.5rem",
      maxWidth: "26rem",
    },
  },
});

export const previewFormWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",

  "@media": {
    [breakpoint]: {
      flexDirection: "row",
      gap: "3rem",
    },
  },
});

export const preview = style({
  "@media": {
    [breakpoint]: {
      flex: "1 1 0",
    },
  },
});

export const formCard = style({
  "@media": {
    [breakpoint]: {
      flex: "0 1 auto",
      minWidth: formCardMaxWidth,
    },
  },
});

const wrapBreakpoint = "screen and (max-width: 30rem)";

export const header = style({
  "@media": {
    [wrapBreakpoint]: styles.mobileHeaderStyles,
  },
});

export const title = style({
  "@media": {
    [wrapBreakpoint]: styles.mobileTitleStyles,
  },
});

export const action = style({
  "@media": {
    [wrapBreakpoint]: styles.mobileActionStyles,
  },
});
