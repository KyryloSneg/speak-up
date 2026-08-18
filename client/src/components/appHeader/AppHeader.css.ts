import { appGridSpacing } from "@/utils/styleConsts";
import { style } from "@vanilla-extract/css";

export const paddingInline = appGridSpacing;
export const paddingBlock = "0.5rem";

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  width: "100%",
  height: "max-content",
  paddingInline,
  paddingBlock: "0.5rem",
  marginBottom: "3rem",
});
