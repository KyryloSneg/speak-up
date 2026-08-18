import getRegularShadow from "@/components/roomMembers/cards/card/utils/getRegularShadow";
import { globalThemeContract } from "@/styles/theme.css";
import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import getTwBoxShadow from "@/utils/getTwBoxShadow";
import { cn } from "@/utils/shadcn/utils";
import { createVar, style } from "@vanilla-extract/css";

const transitionDuration = createVar();
const transitionConfig = `${transitionDuration} var(--transition-timing-function-fast-out-slow-in)`;

const buttonGap = createVar();
const pictureGroupPy = createVar();
const pictureSize = createVar();

export const button = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: buttonGap,
  backgroundColor: globalThemeContract.backgroundColor.secondary,
  boxShadow: getTwBoxShadow(
    getRegularShadow(globalThemeContract.backgroundColor.secondary),
  ),
  transition: formatCommaSeparatedCss(`
    gap ${transitionConfig},
    box-shadow var(--default-transition-duration) ease-in-out
  `),
  vars: {
    [buttonGap]: "0.375rem",
    [pictureGroupPy]: "0.4125rem",
    [transitionDuration]: "150ms",
  },
  "@container": {
    "(min-width: 17rem)": {
      vars: {
        [buttonGap]: "0.625rem",
        [pictureGroupPy]: "0.625rem",
        [pictureSize]: "3rem",
      },
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      vars: {
        [transitionDuration]: "0ms",
      },
    },
  },
});

const pictureOffset = "0.1875rem";
export const pictureGroup = style({
  display: "flex",
  alignItems: "center",
  paddingInline: `calc(${pictureGroupPy} - ${pictureOffset} * 0.5)`,
  paddingBlock: pictureGroupPy,
  borderRadius: "var(--radius)",
  backgroundColor: globalThemeContract.backgroundColor.tertiary,
});

const picture = cn(
  "shadow-sm",
  style({
    position: "relative",
    aspectRatio: "1",
    width: pictureSize,
    height: pictureSize,
    borderRadius: "50%",
    transition: formatCommaSeparatedCss(`
      width ${transitionConfig},
      height ${transitionConfig}
    `),
    vars: {
      [pictureSize]: "1.5rem",
    },
    "@container": {
      "(min-width: 10rem)": {
        vars: {
          [pictureSize]: "2rem",
        },
      },
      "(min-width: 14rem)": {
        vars: {
          [pictureSize]: "2.5rem",
        },
      },
      "(min-width: 18rem)": {
        vars: {
          [pictureSize]: "3.5rem",
        },
      },
      "(min-width: 21rem)": {
        vars: {
          [pictureSize]: "4rem",
        },
      },
    },
  }),
);

export const firstPicture = cn(
  picture,
  style({
    left: pictureOffset,
    zIndex: 1,
  }),
);

export const secondPicture = cn(
  picture,
  style({
    right: pictureOffset,
    zIndex: 2,
  }),
);

const pFontSize = createVar();
export const p = style({
  textAlign: "center",
  transition: `font-size ${transitionConfig}`,
  fontSize: pFontSize,
  vars: {
    [pFontSize]: "0.875rem",
  },
  "@container": {
    "(min-width: 11.25rem)": {
      vars: {
        [pFontSize]: "1rem",
      },
    },
    "(min-width: 14rem)": {
      vars: {
        [pFontSize]: "1.125rem",
      },
    },
    "(min-width: 20rem)": {
      vars: {
        [pFontSize]: "1.25rem",
      },
    },
  },
});
