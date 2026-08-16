import useMemberCardsLayout from "@/composables/useMemberCardsLayout";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockWidth = ref(1000);
const mockHeight = ref(800);

const mockBoundaries = ref<{ maxCols: number; maxRows: number } | null>({
  maxCols: 2,
  maxRows: 2,
});

vi.mock("@vueuse/core", () => ({
  useElementSize: vi.fn(() => ({
    width: mockWidth,
    height: mockHeight,
  })),
}));

vi.mock("@/composables/useMemberCardsMaxColsAndRows", () => ({
  default: vi.fn(() => mockBoundaries),
}));

vi.mock("@/utils/mediaConsts", () => ({
  DEFAULT_ASPECT_RATIO_W: 16,
  DEFAULT_ASPECT_RATIO_H: 9,
}));

const mockCalcLayout = vi.hoisted(() =>
  vi.fn((items: { id: string }[], maxCols: number, maxRows: number) => {
    const total = items.length;
    const maxItems = maxCols * maxRows;

    const visibleCount = Math.min(total, maxItems);
    const hiddenCount = total - visibleCount;

    const layoutItems = items.map((item, index) => {
      const isVisible = index < visibleCount;

      return {
        id: item.id,
        visible: isVisible,
        row: isVisible ? Math.floor(index / maxCols) : null,
        col: isVisible ? index % maxCols : null,
        widthPercent: isVisible ? 50 : 0,
        heightPercent: isVisible ? 50 : 0,
        style: { width: isVisible ? "50%" : "0%" },
      };
    });

    const rowCount = Math.ceil(visibleCount / maxCols) || 0;
    const rows = [];

    for (let r = 0; r < rowCount; r++) {
      const rowItems = layoutItems.filter(i => i.row === r);
      rows.push({
        index: r,
        itemCount: rowItems.length,
        widthPercent: 100,
        items: rowItems,
      });
    }

    return {
      visibleCount,
      hiddenCount,
      rowCount,
      rows,
      items: layoutItems,
      gridStyle: { display: "grid" },
    };
  }),
);

vi.mock("@/utils/roomMemberCards/calcMemberCardsLayout", () => ({
  default: mockCalcLayout,
}));

describe("useMemberCardsLayout", () => {
  const dummyRef = ref<HTMLElement | null>(null);

  beforeEach(() => {
    vi.clearAllMocks();

    mockWidth.value = 1000;
    mockHeight.value = 800;
    mockBoundaries.value = { maxCols: 2, maxRows: 2 };
  });

  it("returns default object with null initLastVisibleItem when boundaries are missing", () => {
    mockBoundaries.value = null;

    const items = [{ userId: "user-1", type: "user" as const }];
    const layout = useMemberCardsLayout(items, dummyRef);

    expect(layout.value).toEqual({ initLastVisibleItem: null });
    expect(mockCalcLayout).not.toHaveBeenCalled();
  });

  it("maps user items and computes layout when all items fit within capacity", () => {
    const items = [
      { userId: "user-1", type: "user" as const },
      { userId: "user-2", type: "screenSharing" as const },
    ];

    const layout = useMemberCardsLayout(items, dummyRef);

    expect(layout.value.visibleCount).toBe(2);
    expect(layout.value.hiddenCount).toBe(0);

    expect(mockCalcLayout).toHaveBeenCalledWith(
      [{ id: "user-1-user" }, { id: "user-2-screenSharing" }],
      2,
      2,
      16 / 9,
      1000,
      800,
    );

    expect(layout.value.items).toEqual([
      expect.objectContaining({
        id: "user-1",
        origId: "user-1-user",
        type: "user",
        visible: true,
      }),
      expect.objectContaining({
        id: "user-2",
        origId: "user-2-screenSharing",
        type: "screenSharing",
        visible: true,
      }),
    ]);

    expect(layout.value.initLastVisibleItem).toEqual(
      expect.objectContaining({ id: "user-2", type: "screenSharing" }),
    );
  });

  it("adjusts layout to reserve space for overflow component when hidden items exist", () => {
    const items = [
      { userId: "u1", type: "user" as const },
      { userId: "u2", type: "user" as const },
      { userId: "u3", type: "user" as const },
      { userId: "u4", type: "user" as const },
      { userId: "u5", type: "user" as const },
    ];

    const layout = useMemberCardsLayout(items, dummyRef);

    expect(layout.value.visibleCount).toBe(3);
    expect(layout.value.hiddenCount).toBe(2);

    const fourthItem = layout.value.items?.find(item => item.id === "u4");
    expect(fourthItem).toEqual({
      id: "u4",
      visible: false,
      row: null,
      col: null,
      widthPercent: 0,
      heightPercent: 0,
      style: {
        width: "0%",
        maxWidth: "0%",
        maxHeight: "0%",
      },
    });

    expect(layout.value.initLastVisibleItem).toEqual(
      expect.objectContaining({ id: "u4", visible: true }),
    );
  });

  it("updates layout reactively when items ref changes", () => {
    const itemsRef = ref([
      { userId: "u1", type: "user" as "user" | "screenSharing" },
    ]);

    const layout = useMemberCardsLayout(itemsRef, dummyRef);
    expect(layout.value.visibleCount).toBe(1);

    itemsRef.value = [
      { userId: "u1", type: "user" },
      { userId: "u2", type: "screenSharing" },
    ];

    expect(layout.value.visibleCount).toBe(2);
    expect(layout.value.items).toHaveLength(2);
  });

  it("accepts items passed as a getter function", () => {
    const itemsGetter = () => [{ userId: "u1", type: "user" as const }];
    const layout = useMemberCardsLayout(itemsGetter, dummyRef);

    expect(layout.value.visibleCount).toBe(1);
    expect(layout.value.items?.[0]?.id).toBe("u1");
  });
});
