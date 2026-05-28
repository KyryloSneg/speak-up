import getRGBFromHEX from "./getRGBFromHEX.ts";

function getContrastColorToUse(
  contrastColor: string | [r: number, g: number, b: number],
): "#000000" | "#ffffff" {
  const rgbColor =
    typeof contrastColor === "string" && contrastColor[0] === "#"
      ? getRGBFromHEX(contrastColor)
      : contrastColor;

  if (!Array.isArray(rgbColor)) throw new Error("Invalid contrastColor");

  const c = rgbColor.map(col => {
    const colToCompare = col / 255;

    if (colToCompare <= 0.03928) {
      return colToCompare / 12.92;
    }

    return Math.pow((colToCompare + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return luminance <= 0.179 ? "#ffffff" : "#000000";
}

export default getContrastColorToUse;
