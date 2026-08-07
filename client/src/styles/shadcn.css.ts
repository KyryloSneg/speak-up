import { globalThemeContract } from "@/styles/theme.css";
import { globalStyle } from "@vanilla-extract/css";

globalStyle(":root", {
  vars: {
    "--background": globalThemeContract.backgroundColor.primary,
    "--foreground": globalThemeContract.color.primary,

    "--card": globalThemeContract.backgroundColor.primary,
    "--card-foreground": globalThemeContract.color.primary,

    "--popover": globalThemeContract.backgroundColor.secondary,
    "--popover-foreground": globalThemeContract.color.primary,

    "--primary": globalThemeContract.backgroundColor.accent,
    "--primary-foreground": globalThemeContract.color.onAccent,

    "--secondary": globalThemeContract.backgroundColor.secondary,
    "--secondary-foreground": globalThemeContract.color.secondary,

    "--muted": globalThemeContract.backgroundColor.tertiary,
    "--muted-foreground": globalThemeContract.color.secondary,

    "--accent": globalThemeContract.backgroundColor.accentSubtle,
    "--accent-foreground": globalThemeContract.color.accent,

    "--destructive": globalThemeContract.backgroundColor.danger,
    "--destructive-foreground": globalThemeContract.color.onDanger,

    "--warning": globalThemeContract.backgroundColor.warning,
    "--success": globalThemeContract.outline.activeSpeaker,

    "--border": globalThemeContract.border.subtle,
    "--input": globalThemeContract.border.element,
    "--ring": globalThemeContract.outline.focus,

    "--radius": "0.625rem",
    "--default-transition-duration": "200ms",
    "--transition-timing-function-fast-out-slow-in":
      "cubic-bezier(0.4, 0, 0.2, 1)",
  },
});
