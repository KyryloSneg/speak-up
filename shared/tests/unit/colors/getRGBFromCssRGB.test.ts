import { describe, expect, it } from "vitest";
import type { RGB } from "../../../types/colorTypes.ts";
import getCssRGBFromRGB from "../../../utils/getCssRGBFromRGB.ts";
import getRGBFromCssRGB from "../../../utils/getRGBFromCssRGB.ts";

describe("getRGBFromCssRGB", () => {
  describe("valid conversion", () => {
    it("should properly convert css RGB to RGB array", () => {
      const origRgb: RGB = [0, 170, 255];

      const cssRgb = `${getCssRGBFromRGB(origRgb)} `; // test .trim presence too
      const rgbArray = getRGBFromCssRGB(cssRgb);

      expect(Array.isArray(rgbArray)).toBe(true);

      expect(rgbArray[0]).toBe(origRgb[0]);
      expect(rgbArray[1]).toBe(origRgb[1]);
      expect(rgbArray[2]).toBe(origRgb[2]);
    });

    it("should properly convert comma-separated css RGB values to RGB array", () => {
      const origRgb: RGB = [0, 170, 255];

      const cssRgb = origRgb.join(", "); // css color vars can be stored in this way
      const rgbArray = getRGBFromCssRGB(cssRgb);

      expect(Array.isArray(rgbArray)).toBe(true);

      expect(rgbArray[0]).toBe(origRgb[0]);
      expect(rgbArray[1]).toBe(origRgb[1]);
      expect(rgbArray[2]).toBe(origRgb[2]);
    });
  });

  describe("invalid conversion", () => {
    it("should throw an error if a corrupted css RGB value is provided", () => {
      expect(() => getRGBFromCssRGB("rgbb(0, 170, 255)")).toThrow();
    });
  });
});
