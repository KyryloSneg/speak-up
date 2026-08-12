import type { RGB } from "../types/colorTypes.ts";

function getRGBFromCssRGB(cssRGB: string): RGB {
  const commaSeparatedRGB = cssRGB
    .trim()
    .replaceAll("rgb(", "")
    .replaceAll(")", "");

  const [r, g, b] = commaSeparatedRGB.split(", ").map(Number);

  if (
    r === undefined ||
    isNaN(r) ||
    g === undefined ||
    isNaN(g) ||
    b === undefined ||
    isNaN(b)
  ) {
    throw new Error("Invalid css RGB");
  }

  return [r, g, b];
}

export default getRGBFromCssRGB;
