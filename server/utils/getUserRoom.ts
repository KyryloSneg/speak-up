import type { User } from "#generated/prisma/client.ts";

function getUserRoom(userId: User["id"]): string {
  const userRoom = `user-${userId}`;
  return userRoom;
}

export default getUserRoom;
