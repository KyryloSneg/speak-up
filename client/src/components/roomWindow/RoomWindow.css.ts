import {
  main,
  mainGap,
  roomWindowTransitionDuration,
  roomWindowTransitionTimingFn,
  roomWindowWidth,
} from "@/views/RoomView.css";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const transitionConfig = `${roomWindowTransitionDuration} ${roomWindowTransitionTimingFn}`;

export const windowWrapper = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "1fr",
  width: roomWindowWidth,
  height: "100%",
  overflow: "hidden",
  opacity: 0,
  transform: `translateX(${mainGap})`,
  willChange: "transform, opacity",
  transition: `
    opacity ${transitionConfig},
    transform ${transitionConfig}
  `.replace(/\s+/g, " "),
  selectors: {
    [`${main}[data-window-open="true"] &`]: {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      transition: "none",
      transform: "none",
    },
  },
});

export const card = recipe({
  base: {
    gridArea: "1 / 1 / 2 / 2",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr",
    gridAutoRows: "auto",
    gap: "1rem",
    height: "100%",
    width: roomWindowWidth,
    overflow: "hidden",
    transition: "visibility 0s, opacity 0s",
  },
  variants: {
    visibility: {
      visible: {
        visibility: "visible",
      },
      hidden: {
        visibility: "hidden",
        pointerEvents: "none",
        opacity: 0,
      },
    },
  },
  defaultVariants: { visibility: "hidden" },
});

export const contentPadding = "1.5rem";
export const content = style({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  paddingInline: contentPadding,
  overflow: "hidden",
});

export const header = style({
  alignItems: "center",
  gap: "1rem",
});
