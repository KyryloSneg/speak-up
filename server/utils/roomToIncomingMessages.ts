import type { Room } from "#types/room.ts";
import type { IOSocket } from "#types/socket.ts";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "@speak-up/shared";

export type RoomToIncomingMessages = Map<
  Room["id"],
  (SocketClientToServerEventsData[typeof SocketEvents.SEND_MESSAGE][number] & {
    socket: IOSocket<true>;
  })[]
>;

const roomToIncomingMessages: RoomToIncomingMessages = new Map();
export default roomToIncomingMessages;
