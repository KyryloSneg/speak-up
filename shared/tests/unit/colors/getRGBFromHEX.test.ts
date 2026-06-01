import { describe, expect, it } from "vitest";
import getRGBFromHEX from "../../../utils/getRGBFromHEX.ts";

describe("getRGBFromHEX", () => {
  describe("valid conversion", () => {
    it("should properly convert HEX to RGB array", () => {
      const mockHEX = "#ff00aa";
      const rgbArray = getRGBFromHEX(mockHEX);

      expect(Array.isArray(rgbArray)).toBe(true);

      expect(rgbArray[0]).toBe(255);
      expect(rgbArray[1]).toBe(0);
      expect(rgbArray[2]).toBe(170);
    });
  });

  describe("invalid conversion", () => {
    it("should return corrupted RGB when providing a HEX string without hashtag", () => {
      const mockHEX = "ff00aa";
      const rgbArray = getRGBFromHEX(mockHEX);

      expect(Array.isArray(rgbArray)).toBe(true);
      expect(rgbArray).not.toBe([255, 0, 170]);
    });

    it("should return corrupted RGB when providing an arbitrary string", () => {
      const input = "pass123$HEX";
      const rgbArray = getRGBFromHEX(input);

      expect(Array.isArray(rgbArray)).toBe(true);
      expect(rgbArray).not.toBe([255, 0, 170]);
    });
  });
});
