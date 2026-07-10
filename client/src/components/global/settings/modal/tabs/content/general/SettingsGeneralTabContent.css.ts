import { globalStyle, style } from "@vanilla-extract/css";

export const formCard = style({
  background: "none",
  border: "none",
  boxShadow: "none",
  maxWidth: "23rem",
  padding: 0,
});

globalStyle(
  `${formCard} [data-slot="card-content"], ${formCard} [data-slot="card-footer"]`,
  {
    padding: 0,
  },
);
