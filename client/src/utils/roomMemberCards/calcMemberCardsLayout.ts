import { cardsGap } from "@/components/roomMembers/cards/list/RoomMemberCardsList.css";
import getUnitValue from "@/utils/getUnitValue";
import {
  DEFAULT_ASPECT_RATIO_H,
  DEFAULT_ASPECT_RATIO_W,
} from "@/utils/mediaConsts";
import { getMaxItems } from "@/utils/roomMemberCards/memberCardsUtils";
import { pxInRem } from "@/utils/styleConsts";
import type { StyleValue } from "vue";

const defaultGapPx = getUnitValue(cardsGap) / pxInRem;

interface Item {
  id: string;
}

export interface LayoutItem<IsVisible extends boolean> {
  id: Item["id"];
  visible: IsVisible;
  row: IsVisible extends true ? number : null;
  col: IsVisible extends true ? number : null;
  widthPercent: number;
  heightPercent: number;
  style: StyleValue;
}

export type AnyLayoutItem = LayoutItem<true> | LayoutItem<false>;

interface Row {
  index: number;
  itemCount: number;
  widthPercent: number;
  items: AnyLayoutItem[];
}

function calcMemberCardsLayout(
  allItems: Item[],
  maxCols: number,
  maxRows: number,
  cardAspectRatio: number = DEFAULT_ASPECT_RATIO_W / DEFAULT_ASPECT_RATIO_H,
  containerWidth?: number,
  containerHeight?: number,
  gapX: number = defaultGapPx,
  gapY: number = defaultGapPx,
): {
  visibleCount: number;
  hiddenCount: number;
  rowCount: number;
  rows: Row[];
  items: AnyLayoutItem[];
  gridStyle: StyleValue;
} {
  const totalItems = allItems.length;
  const maxItems = getMaxItems(maxCols, maxRows);

  const visibleCount = Math.min(totalItems, maxItems);
  const hiddenCount = totalItems - visibleCount;

  if (!visibleCount) {
    return {
      visibleCount: 0,
      hiddenCount: totalItems,
      rowCount: 0,
      rows: [],
      items: [],
      gridStyle: {},
    };
  }

  const rowCount = Math.ceil(visibleCount / maxCols);
  const effectiveCols = Math.ceil(visibleCount / rowCount);

  const totalGridCols = effectiveCols * 2;

  let maxCardWidthStyle = "100%";
  let maxCardHeightStyle = "100%";
  let maxGridWidthStyle = "100%";

  if (
    containerWidth &&
    containerHeight &&
    containerWidth > 0 &&
    containerHeight > 0
  ) {
    const slotWidth =
      (containerWidth - gapX * (effectiveCols - 1)) / effectiveCols;

    const slotHeight = (containerHeight - gapY * (rowCount - 1)) / rowCount;

    if (slotWidth / cardAspectRatio > slotHeight) {
      const constrainedWidth = slotHeight * cardAspectRatio;

      maxCardWidthStyle = `${constrainedWidth.toFixed(2)}px`;
      maxCardHeightStyle = `${slotHeight.toFixed(2)}px`;

      const maxGridWidthPx =
        effectiveCols * constrainedWidth + (effectiveCols - 1) * gapX;

      maxGridWidthStyle = `${maxGridWidthPx.toFixed(2)}px`;
    }
  }

  const baseItemsPerRow = Math.floor(visibleCount / rowCount);
  const remainder = visibleCount % rowCount;

  const rows: Row[] = [];
  const items: AnyLayoutItem[] = [];

  let currentItemIndex = 0;

  for (let row = 0; row < rowCount; row++) {
    const countInRow = baseItemsPerRow + (row < remainder ? 1 : 0);
    const rowItems = [];

    const rowSpanTotal = countInRow * 2;
    const startOffsetCols = Math.floor((totalGridCols - rowSpanTotal) / 2);

    for (let col = 0; col < countInRow; col++) {
      const initItem = allItems[currentItemIndex]!;
      const gridColumnStyle =
        col === 0 ? `${1 + startOffsetCols} / span 2` : "span 2";

      const itemStyle: StyleValue = {
        gridColumn: gridColumnStyle,
        width: "100%",
        height: "auto",
        maxWidth: maxCardWidthStyle,
        maxHeight: maxCardHeightStyle,
        aspectRatio: `${cardAspectRatio}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        justifySelf: "center",
        alignSelf: "center",
      } as const;

      const item: LayoutItem<true> = {
        id: initItem.id,
        visible: true,
        row: row,
        col: col,
        widthPercent: Number((100 / effectiveCols).toFixed(2)),
        heightPercent: Number((100 / rowCount).toFixed(2)),
        style: itemStyle,
      } as const;

      rowItems.push(item);
      items.push(item);

      currentItemIndex++;
    }

    const rowItem: Row = {
      index: row,
      itemCount: countInRow,
      widthPercent: Number((100 / effectiveCols).toFixed(2)),
      items: rowItems,
    } as const;

    rows.push(rowItem);
  }

  for (let i = visibleCount; i < totalItems; i++) {
    const initItem = allItems[i]!;
    const item: LayoutItem<false> = {
      id: initItem.id,
      visible: false,
      row: null,
      col: null,
      widthPercent: 0,
      heightPercent: 0,
      style: {
        gridColumn: "span 2",
        width: "0px",
        height: "0px",
        maxWidth: "0px",
        maxHeight: "0px",
        aspectRatio: `${cardAspectRatio}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        justifySelf: "center",
        alignSelf: "center",
      },
    } as const;

    items.push(item);
  }

  const gridStyle: StyleValue = {
    display: "grid",
    gridTemplateColumns: `repeat(${totalGridCols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rowCount}, auto)`,
    gap: `${gapY}px ${gapX}px`,
    maxWidth: maxGridWidthStyle,
    margin: "0 auto",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    justifyItems: "center",
  } as const;

  return {
    visibleCount,
    hiddenCount,
    rowCount,
    rows,
    items,
    gridStyle,
  };
}

export default calcMemberCardsLayout;
