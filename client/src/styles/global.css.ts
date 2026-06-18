import { globalThemeContract } from "@/styles/theme.css";
import { globalStyle, style, type GlobalStyleRule } from "@vanilla-extract/css";

globalStyle(":root", {
  vars: {
    "--font-heading":
      "'Open Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif",
    "--font-heading-weight": "700",
    "--font-primary":
      "'Raleway', 'Century Gothic', Futura, 'Trebuchet MS', system-ui, sans-serif",
  },
  fontSize: "16px",
  fontFamily: "var(--font-primary)",
  color: globalThemeContract.color.primary,
  backgroundColor: globalThemeContract.backgroundColor.primary,
});

const headingFontFamily = "var(--font-heading)";
const headingFontWeight = "var(--font-heading-weight)";
const baseHeadingStyle: GlobalStyleRule = {
  fontFamily: headingFontFamily,
  fontWeight: headingFontWeight,
} as const;

const h1Styles: GlobalStyleRule = {
  ...baseHeadingStyle,
  fontSize: "3rem",
} as const;

const h2Styles: GlobalStyleRule = {
  ...baseHeadingStyle,
  fontSize: "2rem",
} as const;

const h3Styles: GlobalStyleRule = {
  ...baseHeadingStyle,
  fontSize: "1.75rem",
} as const;

const h4Styles: GlobalStyleRule = {
  ...baseHeadingStyle,
  fontSize: "1.5rem",
} as const;

const h5Styles: GlobalStyleRule = {
  ...baseHeadingStyle,
  fontSize: "1.25rem",
} as const;

const h6Styles: GlobalStyleRule = {
  ...baseHeadingStyle,
  fontSize: "1.125rem",
} as const;

export const h1Typography = style(h1Styles);
export const h2Typography = style(h2Styles);
export const h3Typography = style(h3Styles);
export const h4Typography = style(h4Styles);
export const h5Typography = style(h5Styles);
export const h6Typography = style(h6Styles);

globalStyle("h1", h1Styles);
globalStyle("h2", h2Styles);
globalStyle("h3", h3Styles);
globalStyle("h4", h4Styles);
globalStyle("h5", h5Styles);
globalStyle("h6", h6Styles);

globalStyle("#app", {
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

globalStyle("*", {
  borderColor: globalThemeContract.border.element,
});
