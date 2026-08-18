import type { UserDto } from "@speak-up/shared";

export interface PinnedItem {
  userId: UserDto["id"];
  type: "user" | "screenSharing";
}
