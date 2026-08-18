import type { UserDto } from "@speak-up/shared";

export interface FullScreenItem {
  userId: UserDto["id"];
  type: "user" | "screenSharing";
}
