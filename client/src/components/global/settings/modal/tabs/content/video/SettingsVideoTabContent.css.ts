import { DEFAULT_ASPECT_RATIO_H, DEFAULT_ASPECT_RATIO_W } from "@/utils/consts";
import { style } from "@vanilla-extract/css";

export const previewBgWrapper = style({
  width: "13rem",
  height: "auto",
  aspectRatio: `${DEFAULT_ASPECT_RATIO_W} / ${DEFAULT_ASPECT_RATIO_H}`,
});
