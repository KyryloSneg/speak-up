import { contentPadding } from "@/components/roomWindow/RoomWindow.css";
import { style } from "@vanilla-extract/css";

export const scrollbarPadding = "0.25rem";
export const content = style({
  paddingInline: `calc(${contentPadding} - ${scrollbarPadding})`,
});
