import { getMaxItems } from "@/utils/roomMemberCards/memberCardsUtils";
import { describe, expect, it } from "vitest";

describe("memberCardsUtils", () => {
  describe("getMaxItems", () => {
    it("should properly calculate max items for 4 max cols and 3 max rows", () => {
      const maxCols = 4;
      const maxRows = 3;

      const result = getMaxItems(maxCols, maxRows);
      expect(result).toBe(12);
    });

    it("should properly calculate max items for 4 max cols and 1 max row", () => {
      const maxCols = 4;
      const maxRows = 1;

      const result = getMaxItems(maxCols, maxRows);
      expect(result).toBe(4);
    });

    it("should properly calculate max items for 1 max col and 3 max rows", () => {
      const maxCols = 1;
      const maxRows = 3;

      const result = getMaxItems(maxCols, maxRows);
      expect(result).toBe(3);
    });

    it("should properly calculate max items if max cols is 0", () => {
      const maxCols = 0;
      const maxRows = 3;

      const result = getMaxItems(maxCols, maxRows);
      expect(result).toBe(0);
    });

    it("should properly calculate max items if max rows is 0", () => {
      const maxCols = 4;
      const maxRows = 0;

      const result = getMaxItems(maxCols, maxRows);
      expect(result).toBe(0);
    });
  });
});
