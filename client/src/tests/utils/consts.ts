import type { UserDto } from "@speak-up/shared";

export const mockUser: UserDto = {
  id: "id",
  username: "username",
  nickname: "nickname",
  picture: "picture",
  letterPicture: "letterPicture",
} as const;
