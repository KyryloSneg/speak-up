import { createVar, style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const headerPaddingInline = createVar();

const defaultPadding = "0.5rem";
const defaultHeaderPaddingInline = "0.5625rem";

export const content = recipe({
  base: {
    gridTemplateRows: "auto 1fr",
    justifyItems: "center",
    gap: "0.375rem",
    width: "100vw",
    height: "100vh",
    maxWidth: "100vw",
    maxHeight: "100vh",
    border: "none",
    borderRadius: 0,
    boxShadow: "none",

    vars: {
      [headerPaddingInline]: defaultHeaderPaddingInline,
    },
  },
  variants: {
    type: {
      user: {
        padding: defaultPadding,
      },
      screenSharing: {
        paddingInline: 0,
        paddingBottom: 0,
        paddingTop: defaultPadding,
        vars: {
          [headerPaddingInline]: `calc(${defaultPadding} + ${defaultHeaderPaddingInline})`,
        },
      },
    },
  },
  defaultVariants: { type: "user" },
});

export const header = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingInline: headerPaddingInline,
});

export const title = style({
  fontSize: "1.5rem",
});
