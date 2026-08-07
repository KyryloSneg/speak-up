import { cardsGap } from "@/components/roomMembers/cards/list/RoomMemberCardsList.css";
import getUnitValue from "@/utils/getUnitValue";
import {
  DEFAULT_ASPECT_RATIO_H,
  DEFAULT_ASPECT_RATIO_W,
} from "@/utils/mediaConsts";
import { pxInRem } from "@/utils/styleConsts";

const cardsGapPx = getUnitValue(cardsGap) / pxInRem;

const MIN_CARD_WIDTH = 185;
const MIN_CARD_HEIGHT = 110;

const MIN_CARD_AREA_RATIO_FOR_EXTRA_ROWS = 0.55;

interface GridCandidate {
  cols: number;
  rows: number;
  visibleCount: number;
  cardWidth: number;
  cardHeight: number;
  singleCardArea: number;
  totalArea: number;
}

function calcMemberCardsMaxColsAndRows(
  totalItems: number,
  width: number,
  height: number,
  cardAspectRatio: number = DEFAULT_ASPECT_RATIO_W / DEFAULT_ASPECT_RATIO_H,
  gapX: number = cardsGapPx,
  gapY: number = cardsGapPx,
): {
  maxCols: number;
  maxRows: number;
} {
  if (totalItems <= 0 || width <= 0 || height <= 0) {
    return { maxCols: 1, maxRows: 1 };
  }

  const maxPossibleCols = Math.max(
    1,
    Math.floor((width + gapX) / (MIN_CARD_WIDTH + gapX)),
  );

  const maxPossibleRows = Math.max(
    1,
    Math.floor((height + gapY) / (MIN_CARD_HEIGHT + gapY)),
  );

  let maxColsAllowed = Math.min(5, maxPossibleCols);
  let maxRowsAllowed = Math.min(4, maxPossibleRows);

  if (totalItems > 1 && maxColsAllowed * maxRowsAllowed < 2) {
    if (width >= height * cardAspectRatio) {
      maxColsAllowed = 2;
    } else {
      maxRowsAllowed = 2;
    }
  }

  const candidates: GridCandidate[] = [];
  const fallbackCandidates: GridCandidate[] = [];

  const colLimit = Math.min(totalItems, maxColsAllowed);

  for (let cols = 1; cols <= colLimit; cols++) {
    for (let rows = 1; rows <= maxRowsAllowed; rows++) {
      const capacity = cols * rows;
      if (totalItems > 1 && capacity < 2) continue;

      const availableWidth = (width - gapX * (cols - 1)) / cols;
      const availableHeight = (height - gapY * (rows - 1)) / rows;

      if (availableWidth <= 0 || availableHeight <= 0) continue;

      let cardWidth = availableWidth;
      let cardHeight = cardWidth / cardAspectRatio;

      if (cardHeight > availableHeight) {
        cardHeight = availableHeight;
        cardWidth = cardHeight * cardAspectRatio;
      }

      const visibleCount = capacity >= totalItems ? totalItems : capacity - 1;
      const singleCardArea = cardWidth * cardHeight;
      const totalArea = visibleCount * singleCardArea;

      const candidate: GridCandidate = {
        cols,
        rows,
        visibleCount,
        cardWidth,
        cardHeight,
        singleCardArea,
        totalArea,
      };

      fallbackCandidates.push(candidate);

      if (cardWidth >= MIN_CARD_WIDTH && cardHeight >= MIN_CARD_HEIGHT) {
        candidates.push(candidate);
      }
    }
  }

  const selectBestCandidate = (list: GridCandidate[]): GridCandidate | null => {
    if (list.length === 0) return null;
    let best = list[0]!;

    for (let i = 1; i < list.length; i++) {
      const current = list[i]!;

      if (current.visibleCount > best.visibleCount) {
        if (current.rows > best.rows) {
          if (
            current.singleCardArea >=
            best.singleCardArea * MIN_CARD_AREA_RATIO_FOR_EXTRA_ROWS
          ) {
            best = current;
          }
        } else {
          best = current;
        }
      } else if (current.visibleCount === best.visibleCount) {
        if (current.singleCardArea > best.singleCardArea * 1.02) {
          best = current;
        } else if (
          Math.abs(current.singleCardArea - best.singleCardArea) <=
          best.singleCardArea * 0.02
        ) {
          if (current.rows < best.rows) best = current;
        }
      }
    }

    return best;
  };

  const winner =
    selectBestCandidate(candidates) ?? selectBestCandidate(fallbackCandidates);

  if (!winner) {
    if (totalItems > 1) {
      return width >= height * cardAspectRatio
        ? { maxCols: 2, maxRows: 1 }
        : { maxCols: 1, maxRows: 2 };
    }

    return { maxCols: 1, maxRows: 1 };
  }

  return { maxCols: winner.cols, maxRows: winner.rows };
}

export default calcMemberCardsMaxColsAndRows;
