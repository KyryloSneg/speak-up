import calcMemberCardsLayout from "@/utils/roomMemberCards/calcMemberCardsLayout";
import { describe, expect, it, vi } from "vitest";
import type { CSSProperties } from "vue";

vi.mock("@/components/roomMembers/cards/list/RoomMemberCardsList.css", () => ({
  cardsGap: "16px",
}));

vi.mock("@/utils/getUnitValue", () => ({
  default: vi.fn(() => 16),
}));

vi.mock("@/utils/mediaConsts", () => ({
  DEFAULT_ASPECT_RATIO_W: 16,
  DEFAULT_ASPECT_RATIO_H: 9,
}));

vi.mock("@/utils/styleConsts", () => ({
  pxInRem: 1,
}));

describe("calcMemberCardsLayout", () => {
  const ASPECT_RATIO = 16 / 9;

  describe("Empty & Zero Items", () => {
    it("returns empty layout when allItems is empty", () => {
      const result = calcMemberCardsLayout([], 2, 2);

      expect(result).toEqual({
        visibleCount: 0,
        hiddenCount: 0,
        rowCount: 0,
        rows: [],
        items: [],
        gridStyle: {},
      });
    });
  });

  describe("Visible vs Hidden Items Capacity", () => {
    it("renders all items as visible when under capacity", () => {
      const items = [{ id: "user-1" }, { id: "user-2" }];
      const result = calcMemberCardsLayout(items, 2, 2);

      expect(result.visibleCount).toBe(2);
      expect(result.hiddenCount).toBe(0);
      expect(result.items.every(i => i.visible)).toBe(true);
    });

    it("splits items into visible and hidden when exceeding capacity", () => {
      const items = [
        { id: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
      ];

      const result = calcMemberCardsLayout(items, 2, 2);

      expect(result.visibleCount).toBe(4);
      expect(result.hiddenCount).toBe(1);

      const visibleItems = result.items.filter(i => i.visible);
      const hiddenItems = result.items.filter(i => !i.visible);

      expect(visibleItems).toHaveLength(4);
      expect(hiddenItems).toHaveLength(1);

      expect(hiddenItems[0]).toMatchObject({
        id: "5",
        visible: false,
        row: null,
        col: null,
        widthPercent: 0,
        heightPercent: 0,
      });
    });
  });

  describe("Grid & Row Distribution Logic", () => {
    it("calculates correct rows and effective grid columns for even distribution", () => {
      const items = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
      const result = calcMemberCardsLayout(items, 2, 2);

      expect(result.rowCount).toBe(2);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]?.itemCount).toBe(2);
      expect(result.rows[1]?.itemCount).toBe(2);
    });

    it("centers remainder items on incomplete rows using grid column offsets", () => {
      const items = [{ id: "1" }, { id: "2" }, { id: "3" }];
      const result = calcMemberCardsLayout(items, 2, 2);

      expect(result.rowCount).toBe(2);
      expect(result.rows[0]?.itemCount).toBe(2);
      expect(result.rows[1]?.itemCount).toBe(1);

      const firstRowFirstCol = result.rows[0]?.items[0];
      const secondRowFirstCol = result.rows[1]?.items[0];

      expect(firstRowFirstCol?.style).toHaveProperty(
        "gridColumn",
        "1 / span 2",
      );

      expect(secondRowFirstCol?.style).toHaveProperty(
        "gridColumn",
        "2 / span 2",
      );
    });
  });

  describe("Container Dimension Constraints", () => {
    it("uses percentage fallback when container dimensions are not provided", () => {
      const items = [{ id: "1" }];

      const result = calcMemberCardsLayout(items, 1, 1);
      const itemStyle = result.items[0]?.style as CSSProperties;

      expect(itemStyle.maxWidth).toBe("100%");
      expect(itemStyle.maxHeight).toBe("100%");

      expect(result.gridStyle).toHaveProperty("maxWidth", "100%");
    });

    it("constrains card max-width and max-height based on slot aspect ratio", () => {
      const items = [{ id: "1" }];
      const result = calcMemberCardsLayout(
        items,
        1,
        1,
        ASPECT_RATIO,
        1600,
        400,
        16,
        16,
      );

      const itemStyle = result.items[0]?.style as CSSProperties;
      const expectedHeight = 400;
      const expectedWidth = expectedHeight * ASPECT_RATIO;

      expect(itemStyle.maxHeight).toBe(`${expectedHeight.toFixed(2)}px`);
      expect(itemStyle.maxWidth).toBe(`${expectedWidth.toFixed(2)}px`);
      expect(result.gridStyle).toHaveProperty(
        "maxWidth",
        `${expectedWidth.toFixed(2)}px`,
      );
    });
  });

  describe("Grid Container Styles", () => {
    it("returns formatted CSS grid style object", () => {
      const items = [{ id: "1" }, { id: "2" }];
      const result = calcMemberCardsLayout(items, 2, 1);

      expect(result.gridStyle).toMatchObject({
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gridTemplateRows: "repeat(1, auto)",
        gap: "16px 16px",
        margin: "0 auto",
      });
    });
  });
});
