import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

const borderRadius = "calc(var(--radius) * 2)";

export const bgWrapper = style({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: globalThemeContract.backgroundColor.videoGrid,
  borderRadius,
  boxShadow: `
    inset 0px 24px 32px -12px rgba(0, 0, 0, 0.65),
    inset 0px 4px 16px 0px rgba(0, 0, 0, 0.45),
    var(--tw-shadow),
  `,

  selectors: {
    ':root[data-theme="dark"] &': {
      boxShadow: `
        inset 0px 20px 24px -12px rgba(0, 0, 0, 0.8),
        inset 0px 2px 10px 0px rgba(0, 0, 0, 0.6),
        var(--tw-shadow),
      `,
    },
  },
});

export const bg = style({
  position: "absolute",
  inset: -1,
  width: "calc(100% + 1px)",
  height: "calc(100% + 1px)",
  objectFit: "cover",
  borderRadius,
});
