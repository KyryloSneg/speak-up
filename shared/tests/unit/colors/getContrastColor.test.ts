import { describe, expect, it } from "vitest";
import { CONTRAST_COLOR, getContrastColor } from "../../../utils/index.ts";

describe("getContrastColor", () => {
  describe("valid identifying", () => {
    describe("HEX string", () => {
      describe("light colors", () => {
        it("should identify the opposite color of #ffffff as black", () => {
          const mockHEX = "#ffffff";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });

        it("should identify the opposite color of #c8c8c8 as black", () => {
          const mockHEX = "#c8c8c8";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });

        it("should identify the opposite color of #ff00aa as black", () => {
          const mockHEX = "#ff00aa";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });

        it("should identify the opposite color of #ff00aa as black if array's length > 3", () => {
          const mockHEX = "#ff00aa";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });
      });

      describe("dark colors", () => {
        it("should identify the opposite color of #000000 as white", () => {
          const mockHEX = "#000000";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });

        it("should identify the opposite color of #373737 as white", () => {
          const mockHEX = "#373737";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });

        it("should identify the opposite color of #8b0000 as white", () => {
          const mockHEX = "#8b0000";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });

        it("should identify the opposite color of #8b0000 as white if array's length > 3", () => {
          const mockHEX = "#8b0000";
          const contrastColor = getContrastColor(mockHEX);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });
      });
    });

    describe("RGB array", () => {
      describe("light colors", () => {
        it("should identify the opposite color of [255, 255, 255] as black", () => {
          const rgbArray = [255, 255, 255] as const;
          const contrastColor = getContrastColor(rgbArray);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });

        it("should identify the opposite color of [200, 200, 200] as black", () => {
          const rgbArray = [200, 200, 200] as const;
          const contrastColor = getContrastColor(rgbArray);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });

        it("should identify the opposite color of [255, 0, 170] as black", () => {
          const rgbArray = [255, 0, 170] as const;
          const contrastColor = getContrastColor(rgbArray);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });

        it("should identify the opposite color of [255, 0, 170] as black if array's length > 3", () => {
          const rgbArray = [255, 0, 170, 90] as const;
          const contrastColor = getContrastColor(rgbArray as any);

          expect(contrastColor).toBe(CONTRAST_COLOR.Black);
        });
      });

      describe("dark colors", () => {
        it("should identify the opposite color of [0, 0, 0] as white", () => {
          const rgbArray = [0, 0, 0] as const;
          const contrastColor = getContrastColor(rgbArray);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });

        it("should identify the opposite color of [55, 55, 55] as white", () => {
          const rgbArray = [55, 55, 55] as const;
          const contrastColor = getContrastColor(rgbArray);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });

        it("should identify the opposite color of [139, 0, 0]", () => {
          const rgbArray = [139, 0, 0] as const;
          const contrastColor = getContrastColor(rgbArray);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });

        it("should identify the opposite color of [139, 0, 0] as white if array's length > 3", () => {
          const rgbArray = [139, 0, 0, 90] as const;
          const contrastColor = getContrastColor(rgbArray as any);

          expect(contrastColor).toBe(CONTRAST_COLOR.White);
        });
      });
    });
  });

  describe("invalid identifying", () => {
    describe("HEX string", () => {
      it("should throw an error on invalid HEX string", () => {
        const input = "ff00aa";
        expect(() => getContrastColor(input)).toThrow();
      });
    });
  });
});
