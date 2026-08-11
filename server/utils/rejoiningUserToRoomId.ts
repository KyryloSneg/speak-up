import type { User } from "#generated/prisma/client.ts";
import type { Room } from "#types/room.ts";

export type RejoiningUserToRoomId = Map<
  User["id"],
  { id: Room["id"]; createdAt: Date }
>;

const rejoiningUserToRoomId: RejoiningUserToRoomId = new Map();
export default rejoiningUserToRoomId;
