import {
  breakpoint as buttonGroupBreakpoint,
  distanceToPreview,
} from "@/components/userMedia/preview/buttonGroup/UserMediaPreviewButtonGroup.css";
import { globalThemeContract } from "@/styles/theme.css";
import {
  DEFAULT_ASPECT_RATIO_H,
  DEFAULT_ASPECT_RATIO_W,
} from "@/utils/mediaConsts";
import { style } from "@vanilla-extract/css";

export const baseBottomMargin = "1rem";
export const additionalSpaceForMobileButtonGroup = `calc(${baseBottomMargin} + 3rem + ${distanceToPreview})`;

export const section = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "52rem",
});

export const preview = style({
  position: "relative",
  width: "100%",
  aspectRatio: `${DEFAULT_ASPECT_RATIO_W} / ${DEFAULT_ASPECT_RATIO_H}`,
  marginBottom: additionalSpaceForMobileButtonGroup,

  "@media": {
    [buttonGroupBreakpoint]: {
      marginBottom: baseBottomMargin,
    },
  },
});

const overlayPadding = "1rem";
export const overlay = style({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: "1.5rem",
  padding: overlayPadding,
  position: "absolute",
  zIndex: 1,
  inset: 0,
});

export const audioMeter = style({
  position: "absolute",
  left: overlayPadding,
  bottom: overlayPadding,
  zIndex: -1,
  padding: "0.375rem",
  borderRadius: "50%",
  backgroundColor: globalThemeContract.backgroundColor.secondary,
});
