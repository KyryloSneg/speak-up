import {
  paddingBlock,
  paddingInline,
} from "@/components/appHeader/AppHeader.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingInline: paddingInline,
  paddingBlock: paddingBlock,
});

export const main = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridAutoFlow: "column",
  gridAutoColumns: "auto",
  alignItems: "center",
  gap: "2rem",
  width: "100%",
  height: "100%",
});

export const footer = style({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  padding: "1rem",
});

globalStyle("#app", {
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto 1fr auto",
  height: "100vh",
  width: "100vw",
  minHeight: "20rem",
  maxHeight: "100vh",
  maxWidth: "100vw",
});
