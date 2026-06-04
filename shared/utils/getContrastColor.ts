import type { RGB } from "../types/colorTypes.ts";
import getRGBFromHEX from "./getRGBFromHEX.ts";

export const enum CONTRAST_COLOR {
  White = "#ffffff",
  Black = "#000000",
}

function getContrastColorToUse(
  contrastColor: string | RGB,
): CONTRAST_COLOR.White | CONTRAST_COLOR.Black {
  const rgbColor =
    typeof contrastColor === "string" && contrastColor[0] === "#"
      ? getRGBFromHEX(contrastColor)
      : contrastColor;

  if (
    !Array.isArray(rgbColor) ||
    rgbColor.some(item => typeof item !== "number") ||
    rgbColor.length < 3
  ) {
    throw new Error("Invalid contrastColor");
  }

  const c = rgbColor.map(col => {
    const colToCompare = col / 255;

    if (colToCompare <= 0.03928) {
      return colToCompare / 12.92;
    }

    return Math.pow((colToCompare + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return luminance <= 0.179 ? CONTRAST_COLOR.White : CONTRAST_COLOR.Black;
}

export default getContrastColorToUse;
