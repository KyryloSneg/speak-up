import getRegularShadow from "@/components/roomMembers/cards/card/utils/getRegularShadow";
import { globalThemeContract } from "@/styles/theme.css";
import getTwBoxShadow from "@/utils/getTwBoxShadow";
import { createVar, style } from "@vanilla-extract/css";

const transitionDuration = createVar();
const transitionConfig = `${transitionDuration} var(--transition-timing-function-fast-out-slow-in)`;

const fontSize = createVar();
export const p = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize,
  backgroundColor: globalThemeContract.backgroundColor.secondary,
  boxShadow: getTwBoxShadow(
    getRegularShadow(globalThemeContract.backgroundColor.secondary),
  ),
  pointerEvents: "none",
  transition: `font-size ${transitionConfig}`,
  vars: {
    [fontSize]: "1.125rem",
    [transitionDuration]: "150ms",
  },

  "@container": {
    "(min-width: 13.125rem)": {
      vars: {
        [fontSize]: "1.25rem",
      },
    },
    "(min-width: 15rem)": {
      vars: {
        [fontSize]: "1.375rem",
      },
    },
    "(min-width: 16rem)": {
      vars: {
        [fontSize]: "1.5rem",
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
