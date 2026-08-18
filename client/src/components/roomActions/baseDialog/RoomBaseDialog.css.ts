import * as roomChatScrollDownStyles from "@/components/roomWindow/chat/messageList/scrollDown/RoomChatScrollDown.css";
import { contentPadding } from "@/components/roomWindow/RoomWindow.css";
import { globalStyle, style } from "@vanilla-extract/css";

export const actualContentSlot = "actual-content";

const drawerHeaderAndFooterPaddingBreakpoint = "(max-height: 22.5rem)";
const drawerHeaderAndFooterSmPadding = "0.5rem";

const distanceToViewport = "2rem";
export const content = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gridTemplateRows: "auto 1fr",
  gridAutoRows: "auto",
  gap: "1rem",
  width: "100%",
  height: `calc(100% - ${distanceToViewport})`,
  maxWidth: `min(26rem, calc(100vw - ${distanceToViewport}))`,

  selectors: {
    "&[data-vaul-drawer]": {
      gridTemplateRows: "auto auto 1fr",
      gap: 0,
      maxWidth: "none",
      willChange: "opacity",
    },
  },
});

export const header = style({
  marginBottom: "1rem",
  selectors: {
    "[data-vaul-drawer] &": {
      margin: "0px !important",
    },
  },
  "@media": {
    [drawerHeaderAndFooterPaddingBreakpoint]: {
      padding: drawerHeaderAndFooterSmPadding,
    },
    "(min-height: 21.25rem)": {
      marginBottom: "2rem",
    },
  },
});

export const title = style({
  selectors: {
    "[data-slot='drawer-content'] &": {
      textAlign: "center",
    },
  },
  "@media": {
    "(max-height: 26rem)": {
      selectors: {
        "[data-slot='drawer-content'] &": {
          fontSize: "1.5rem",
        },
      },
    },
  },
});

export const footer = style({
  selectors: {
    "&[data-vaul-drawer] &": {
      paddingInline: contentPadding,
    },
  },
  "@media": {
    [drawerHeaderAndFooterPaddingBreakpoint]: {
      padding: drawerHeaderAndFooterSmPadding,
    },
  },
});

globalStyle(
  `${content}[data-vaul-drawer] [data-slot="${actualContentSlot}"] [data-reka-scroll-area-viewport] > *`,
  {
    paddingInline: contentPadding,
  },
);

globalStyle(
  `${content}[data-vaul-drawer] [data-slot="${actualContentSlot}"] [data-scrollbarimpl]`,
  {
    right: `${contentPadding} !important`,
  },
);

globalStyle(
  `${content}[data-vaul-drawer] [data-slot="${actualContentSlot}"] ${roomChatScrollDownStyles.button}`,
  {
    right: `calc(${roomChatScrollDownStyles.distanceToTheSides} + ${contentPadding})`,
  },
);
