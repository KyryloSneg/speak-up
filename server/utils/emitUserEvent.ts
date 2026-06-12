import type { User } from "#generated/prisma/client.ts";
import type { IO } from "#types/socket.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import getUserRoom from "#utils/getUserRoom.ts";
import type { SocketServerToClientEvents } from "@speak-up/shared";

function emitUserEvent<Event extends keyof SocketServerToClientEvents>(
  io: IO,
  userId: User["id"],
  event: Event,
  data: Parameters<SocketServerToClientEvents[Event]>,
  roomsToExclude?: string[],
): void {
  const userRoom = getUserRoom(userId);
  emitRoomEvent(io, userRoom, event, data, roomsToExclude);
}

export default emitUserEvent;
