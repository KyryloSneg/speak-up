import { roomViewOverflowClass } from "@/views/RoomView.css";
import { createVar, style } from "@vanilla-extract/css";

const wrapperContainerName = "room-member-cards-wrapper";

export const wrapper = style([
  roomViewOverflowClass,
  {
    width: "100%",
    height: "100%",
    minWidth: 0,
    containerName: wrapperContainerName,
    containerType: "inline-size",
  },
]);

export const rootSection = style([
  roomViewOverflowClass,
  {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.25rem",
    width: "100%",
    height: "100%",
    minWidth: 0,

    "@container": {
      "(min-width: 58.75rem)": {
        flexDirection: "row",
      },
    },
  },
]);

const listSection = style([
  roomViewOverflowClass,
  {
    width: "100%",
    height: "100%",
    minWidth: 0,
  },
]);

const listSectionBreakpoint = "(min-width: 20.625rem)";

export const mobilePinnedSectionFlex = createVar();
export const desktopPinnedSectionFlex = createVar();

export const pinnedSection = style([
  listSection,
  {
    flex: mobilePinnedSectionFlex,
    "@container": {
      [listSectionBreakpoint]: {
        flex: desktopPinnedSectionFlex,
      },
    },
  },
]);

export const mobileUnpinnedSectionFlex = createVar();
export const desktopUnpinnedSectionFlex = createVar();

export const unpinnedSection = style([
  listSection,
  {
    flex: mobileUnpinnedSectionFlex,
    "@container": {
      [listSectionBreakpoint]: {
        flex: desktopUnpinnedSectionFlex,
      },
    },
  },
]);
