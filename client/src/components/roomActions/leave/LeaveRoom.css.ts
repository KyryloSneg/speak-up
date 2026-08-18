import { desktopRoomActionsBreakpoint } from "@/components/roomActions/RoomActions.css";
import { style } from "@vanilla-extract/css";

export const button = style({
  "@media": {
    [`(min-width: ${desktopRoomActionsBreakpoint})`]: {
      marginLeft: "1rem",
    },
  },
});
