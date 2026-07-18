import {
  paddingBlock,
  paddingInline,
} from "@/components/appHeader/AppHeader.css";
import { appGridSpacing } from "@/utils/styleConsts";
import { globalStyle, style } from "@vanilla-extract/css";

export const roomWindowWidth = "20rem";
export const mainGap = "1.5rem";

export const roomWindowTransitionDuration = "350ms";
export const roomWindowTransitionTimingFn =
  "var(--transition-timing-function-fast-out-slow-in)";

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingInline: paddingInline,
  paddingBlock: paddingBlock,
  marginBottom: "1rem",
});

export const main = style({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr 0px",
  columnGap: "0px",
  alignItems: "center",
  width: "100%",
  height: "100%",
  minHeight: 0,
  paddingInline: appGridSpacing,
  overflow: "hidden",
  transition: `
    grid-template-columns ${roomWindowTransitionDuration} ${roomWindowTransitionTimingFn},
    column-gap ${roomWindowTransitionDuration} ${roomWindowTransitionTimingFn}
  `.replace(/\s+/g, " "),
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
});

export const footer = style({
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
