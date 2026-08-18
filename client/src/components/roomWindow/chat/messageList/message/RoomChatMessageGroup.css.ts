import { globalThemeContract } from "@/styles/theme.css";
import { style } from "@vanilla-extract/css";

export const messageGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  paddingRight: "0.5625rem",
});

const headerGap = "0.75rem";
export const header = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: headerGap,
});

const pictureSize = "1.75rem";
export const picture = style({
  width: pictureSize,
  height: pictureSize,
  borderRadius: "50%",
  objectFit: "cover",
});

export const nickname = style({
  fontSize: "1.0625rem",
  color: globalThemeContract.color.secondary,
});

export const list = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  paddingLeft: `calc(${headerGap} + ${pictureSize})`,
});

export const message = style({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  justifyContent: "space-between",
  wordBreak: "break-word",
  overflowWrap: "break-word",
});

export const time = style({
  fontSize: "0.75rem",
  color: globalThemeContract.color.muted,
  marginLeft: "0.75rem",
});

export const content = style({
  selectors: {
    "&:focus-visible": {
      outline: `${globalThemeContract.outline.focus} solid 1px`,
      outlineOffset: "-1px",
    },
  },
});
