import type { IO } from "#types/socket.ts";
import type { SocketServerToClientEvents } from "@speak-up/shared";

function emitRoomEvent<Event extends keyof SocketServerToClientEvents>(
  io: IO,
  room: string,
  event: Event,
  data: Parameters<SocketServerToClientEvents[Event]>,
  roomsToExclude?: string[],
): void {
  io.to(room)
    .except(roomsToExclude || [])
    .emit(event, ...data);
}

export default emitRoomEvent;
