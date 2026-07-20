import { scrollbarPadding } from "@/components/roomWindow/memberList/RoomMemberList.css";
import { globalThemeContract } from "@/styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const root = style({});

globalStyle(`${root} [data-reka-scroll-area-viewport]`, {
  // do this in order to show "remove" button focus ring
  paddingInline: scrollbarPadding,
});

globalStyle(`${root} [data-scrollbarimpl]`, {
  right: `${scrollbarPadding} !important`,
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
});

export const heading = style({
  fontSize: "1.25rem",
  fontWeight: "400",
  color: globalThemeContract.color.secondary,
});

export const memberAmount = style({
  fontSize: "0.75em",
  letterSpacing: "-0.08em",
  color: globalThemeContract.color.tertiary,
});

export const dl = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "1rem",
});

export const member = style({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
});

export const dt = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: "0.75rem",
});

export const dd = recipe({
  variants: {
    visibility: {
      visible: { marginLeft: "1rem" },
      hidden: {},
    },
  },
  defaultVariants: { visibility: "hidden" },
});

export const picture = style({
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "50%",
  objectFit: "cover",
});

export const nicknameRoleWrapper = style({
  display: "flex",
  flexDirection: "column",
  height: "max-content",
  overflow: "hidden",
});

export const nickname = style({
  fontSize: "0.9375rem",
  fontWeight: "400",
  color: globalThemeContract.color.secondary,
});

export const role = style({
  fontSize: "0.8125rem",
  color: globalThemeContract.color.muted,
});

globalStyle(`${nicknameRoleWrapper} > *`, {
  lineHeight: "1.4",
});
