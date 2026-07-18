import type { Room } from "#types/room.ts";
import type { RoomToIncomingMessages } from "#utils/roomToIncomingMessages.ts";
import roomToIncomingMessages from "#utils/roomToIncomingMessages.ts";
import type { MapValue } from "@speak-up/shared";

function removeIncomingMessages(
  roomId: Room["id"],
  messages: MapValue<RoomToIncomingMessages>,
): void {
  if (!roomToIncomingMessages.has(roomId)) return;
  roomToIncomingMessages.set(
    roomId,
    roomToIncomingMessages
      .get(roomId)!
      .filter(incomingMessage => !messages.includes(incomingMessage)),
  );
}

export default removeIncomingMessages;
