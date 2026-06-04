import type { Token, User } from "#generated/prisma/client.ts";

export const mockUser: User = {
  id: "id",
  username: "username",
  nickname: "nickname",
  picture: "picture",
  letterPicture: "letterPicture",
  password: "password",
} as const;

const { id: _, ...internalMockUserWithoutId } = mockUser;
export const mockUserWithoutId = internalMockUserWithoutId;

export const mockToken: Token = {
  id: "id",
  userId: "userId",
  refreshToken: "refreshToken",
} as const;

export const DEFAULT_SECURE_COOKIES = [
  "Secure",
  "HttpOnly",
  "SameSite=None",
] as const;
