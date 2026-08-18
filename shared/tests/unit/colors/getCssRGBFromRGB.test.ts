import { describe, expect, it } from "vitest";
import type { RGB } from "../../../types/colorTypes.ts";
import getCssRGBFromRGB from "../../../utils/getCssRGBFromRGB.ts";

describe("getCssRGBFromRGB", () => {
  it("should properly convert rgb array to a valid css rgb() fn", () => {
    const rgb: RGB = [30, 170, 255];
    const cssRgb = getCssRGBFromRGB(rgb);

    expect(cssRgb).toBe(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
  });
});
