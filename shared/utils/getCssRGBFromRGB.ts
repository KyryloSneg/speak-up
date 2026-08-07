import type { RGB } from "../types/colorTypes.ts";

function getCssRGBFromRGB(rgb: RGB): string {
  return `rgb(${rgb.join(", ")})`;
}

export default getCssRGBFromRGB;
