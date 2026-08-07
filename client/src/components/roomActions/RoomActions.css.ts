import { globalThemeContract } from "@/styles/theme.css";
import { createVar, style } from "@vanilla-extract/css";

export const mobileGridTemplateColumns = createVar();
export const desktopRoomActionsBreakpoint = "30rem";

export const list = style({
  display: "grid",
  gridTemplateColumns: mobileGridTemplateColumns,
  gridTemplateRows: "1fr",
  alignItems: "center",
  gap: "0.75rem 1.25rem",
  width: "max-content",
  padding: "0.625rem 1rem",
  borderWidth: "1px",
  borderColor: globalThemeContract.border.element,
  borderRadius: "var(--radius)",
  backgroundColor: globalThemeContract.backgroundColor.primary,

  "@media": {
    [`(min-width: ${desktopRoomActionsBreakpoint})`]: {
      display: "flex",
      gridTemplateColumns: "none",
      gridTemplateRows: "none",
      gap: "0.75rem 1rem",
    },
  },
});
