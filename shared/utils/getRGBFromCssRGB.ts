import type { RGB } from "../types/colorTypes.ts";

function getRGBFromCssRGB(cssRGB: string): RGB {
  const commaSeparatedRGB = cssRGB
    .trim()
    .replaceAll("rgb(", "")
    .replaceAll(")", "");

  const [r, g, b] = commaSeparatedRGB.split(", ").map(Number);
  if (!r || !g || !b) throw new Error("Invalid cssRGB");

  return [r, g, b];
}

export default getRGBFromCssRGB;
