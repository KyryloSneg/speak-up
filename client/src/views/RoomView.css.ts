import {
  paddingBlock,
  paddingInline,
} from "@/components/appHeader/AppHeader.css";
import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import { appGridSpacing } from "@/utils/styleConsts";
import { globalStyle, style } from "@vanilla-extract/css";

export const roomViewOverflowClass = style({
  overflow: ["hidden", "clip"],
  overflowClipMargin: "0.5rem",
  minWidth: 0,
  minHeight: 0,
});

export const roomWindowWidth = "23rem";
export const mainGap = "1.5rem";

export const roomWindowTransitionDuration = "350ms";
export const roomWindowTransitionTimingFn =
  "var(--transition-timing-function-fast-out-slow-in)";

export const header = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.875rem",
  width: "100%",
  paddingInline: paddingInline,
  paddingBlock: paddingBlock,
  marginBottom: "1rem",
});

export const main = style([
  roomViewOverflowClass,
  {
    position: "relative",
    // uses lower z-index in to make overflowing items be placed beneath header
    // and footer controls
    zIndex: 0,
    display: "grid",
    gridTemplateColumns: "1fr 0px",
    columnGap: "0px",
    alignItems: "center",
    width: "100%",
    height: "100%",
    minHeight: 0,
    paddingInline: appGridSpacing,
    transition: formatCommaSeparatedCss(`
      grid-template-columns ${roomWindowTransitionDuration} ${roomWindowTransitionTimingFn},
      column-gap ${roomWindowTransitionDuration} ${roomWindowTransitionTimingFn}
    `),
    contain: "layout",

    selectors: {
      [`&[data-window-open="true"]`]: {
        gridTemplateColumns: `1fr ${roomWindowWidth}`,
        columnGap: mainGap,
      },
    },
    "@media": {
      "(prefers-reduced-motion: reduce)": {
        transition: "none",
      },
    },
  },
]);

export const footer = style({
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "center",
  width: "100%",
  padding: "1rem",
});

globalStyle(`#app:has(${main})`, {
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto 1fr auto",
  height: "100vh",
  width: "100vw",
  minHeight: "20rem",
  maxHeight: "100vh",
  maxWidth: "100vw",
  overflow: "hidden",
});
