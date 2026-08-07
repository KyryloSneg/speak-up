import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";
import * as buttonStyles from "./base/BaseRoomMemberCardOverlayButton.css";

export const list = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  borderWidth: 1,
  borderRadius: "calc(var(--radius) * 2)",
  borderColor: globalThemeContract.border.subtle,
  backgroundColor: globalThemeContract.backgroundColor.secondary,
  zIndex: 1,

  selectors: {
    [`&${buttonStyles.smElemOverlaySelector}`]: {
      "@container": {
        [buttonStyles.xsButtonBreakpoint]: {
          padding: "0.3125rem 0.5rem",
        },
      },
    },
  },
});
