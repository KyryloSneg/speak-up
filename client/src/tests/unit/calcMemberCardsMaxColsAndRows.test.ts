import calcMemberCardsMaxColsAndRows from "@/utils/roomMemberCards/calcMemberCardsMaxColsAndRows";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/roomMembers/cards/list/RoomMemberCardsList.css", () => ({
  cardsGap: "16px",
}));

vi.mock("@/utils/mediaConsts", () => ({
  DEFAULT_ASPECT_RATIO_W: 16,
  DEFAULT_ASPECT_RATIO_H: 9,
}));

describe("calcMemberCardsMaxColsAndRows", () => {
  const DEFAULT_ASPECT_RATIO = 16 / 9;

  describe("Edge cases & Guard clauses", () => {
    it("returns { maxCols: 1, maxRows: 1 } for non-positive totalItems", () => {
      expect(calcMemberCardsMaxColsAndRows(0, 1000, 800)).toEqual({
        maxCols: 1,
        maxRows: 1,
      });

      expect(calcMemberCardsMaxColsAndRows(-5, 1000, 800)).toEqual({
        maxCols: 1,
        maxRows: 1,
      });
    });

    it("returns { maxCols: 1, maxRows: 1 } for zero or negative dimensions", () => {
      expect(calcMemberCardsMaxColsAndRows(5, 0, 800)).toEqual({
        maxCols: 1,
        maxRows: 1,
      });

      expect(calcMemberCardsMaxColsAndRows(5, 1000, 0)).toEqual({
        maxCols: 1,
        maxRows: 1,
      });

      expect(calcMemberCardsMaxColsAndRows(5, -100, -100)).toEqual({
        maxCols: 1,
        maxRows: 1,
      });
    });
  });

  describe("Small viewport constraints (Forced 2-item capacity)", () => {
    it("forces maxCols: 2 on landscape containers when allowed items would otherwise be < 2", () => {
      const result = calcMemberCardsMaxColsAndRows(
        3,
        190,
        80,
        DEFAULT_ASPECT_RATIO,
        16,
        16,
      );

      expect(result.maxCols).toBeGreaterThanOrEqual(2);
    });

    it("forces maxRows: 2 on portrait containers when allowed items would otherwise be < 2", () => {
      const result = calcMemberCardsMaxColsAndRows(
        3,
        100,
        300,
        DEFAULT_ASPECT_RATIO,
        16,
        16,
      );

      expect(result.maxRows).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Grid calculation & layout selection", () => {
    it("calculates 1x1 grid for a single item", () => {
      const result = calcMemberCardsMaxColsAndRows(1, 1000, 800);
      expect(result).toEqual({ maxCols: 1, maxRows: 1 });
    });

    it("caps maximum columns at 5 and maximum rows at 4", () => {
      const result = calcMemberCardsMaxColsAndRows(50, 3840, 2160);

      expect(result.maxCols).toBeLessThanOrEqual(5);
      expect(result.maxRows).toBeLessThanOrEqual(4);
    });

    it("selects candidate that maximizes visible count while keeping card size reasonable", () => {
      const result = calcMemberCardsMaxColsAndRows(6, 1280, 720);
      expect(result.maxCols * result.maxRows).toBeGreaterThanOrEqual(6);
    });

    it("prefers layout with fewer rows when visible count and card area are virtually identical", () => {
      const result = calcMemberCardsMaxColsAndRows(4, 1000, 600);
      expect(result.maxRows).toBeLessThanOrEqual(2);
    });

    it("custom gaps and aspect ratios are respected in calculations", () => {
      const squareRatio = 1;
      const customGap = 8;
      const result = calcMemberCardsMaxColsAndRows(
        4,
        800,
        800,
        squareRatio,
        customGap,
        customGap,
      );

      expect(result).toEqual({ maxCols: 2, maxRows: 2 });
    });
  });

  describe("Fallback candidate selection", () => {
    it("falls back to candidate below MIN_CARD dimensions when container is extremely small", () => {
      const result = calcMemberCardsMaxColsAndRows(4, 200, 150);

      expect(result).toHaveProperty("maxCols");
      expect(result).toHaveProperty("maxRows");

      expect(result.maxCols).toBeGreaterThan(0);
      expect(result.maxRows).toBeGreaterThan(0);
    });
  });
});
