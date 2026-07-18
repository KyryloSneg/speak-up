import { globalThemeContract } from "@/styles/theme.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const wrapper = style({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  backgroundColor: globalThemeContract.backgroundColor.secondary,
  width: "100%",
  minWidth: 0,
  padding: "0.5rem",
  paddingLeft: "1rem",
  borderRadius: "1rem",
  border: `1px solid ${globalThemeContract.border.element}`,
  transition:
    "border-color var(--default-transition-duration) ease, box-shadow var(--default-transition-duration) ease",

  selectors: {
    "&:focus-within": {
      borderColor: globalThemeContract.outline.focus,
      boxShadow: `0 0 0 1px ${globalThemeContract.outline.focus}`,
    },
  },
});

export const label = style({
  display: "flex",
  position: "relative",
  width: "100%",
  minWidth: 0,
});

export const textarea = style({
  flex: 1,
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  minHeight: "2.5rem",
  padding: "0.5rem 0",
  border: 0,
  fontSize: "1rem",
  lineHeight: "1.5",
  color: globalThemeContract.color.primary,
  backgroundColor: "transparent",
  outline: "none",
  boxShadow: "none",
  scrollbarWidth: "none",
  resize: "none",
  wordBreak: "break-all",
  overflowWrap: "break-word",

  selectors: {
    "&::-webkit-scrollbar": {
      display: "none",
    },

    "&:focus, &:focus-visible": {
      outline: "none",
      boxShadow: "none",
    },

    "&::placeholder": {
      color: globalThemeContract.color.tertiary,
    },
  },
});

export const error = style({
  position: "absolute",
  right: 0,
  bottom: 0,
  maxWidth: "100%",
  padding: "0.1875rem 0.3125rem",
  fontSize: "0.875rem",
  color: globalThemeContract.color.danger,
  backgroundColor: globalThemeContract.backgroundColor.secondary,
  borderWidth: 1,
  borderColor: globalThemeContract.border.subtle,
  borderRadius: "0.25rem",
});

export const submitButton = style({
  flexShrink: 0,
});

globalStyle(`${submitButton} > svg`, {
  width: "1.25rem",
  height: "1.25rem",
});
