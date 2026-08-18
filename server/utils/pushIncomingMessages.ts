import type { Room } from "#types/room.ts";
import roomToIncomingMessages, {
  type RoomToIncomingMessages,
} from "#utils/roomToIncomingMessages.ts";
import type { MapValue } from "@speak-up/shared";

function pushIncomingMessages(
  roomId: Room["id"],
  messages: MapValue<RoomToIncomingMessages>,
): void {
  if (roomToIncomingMessages.has(roomId)) {
    roomToIncomingMessages.set(roomId, [
      ...roomToIncomingMessages.get(roomId)!,
      ...messages,
    ]);
  } else {
    roomToIncomingMessages.set(roomId, messages);
  }
}

export default pushIncomingMessages;
