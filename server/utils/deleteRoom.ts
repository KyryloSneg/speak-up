import type { Room } from "#types/room.ts";
import rooms from "#utils/rooms.ts";
import roomToIncomingMessages from "#utils/roomToIncomingMessages.ts";
import roomToIsProcessingMessageLoop from "#utils/roomToIsProcessingMessageLoop.ts";

function deleteRoom(id: Room["id"]): void {
  rooms.delete(id);
  roomToIncomingMessages.delete(id);
  roomToIsProcessingMessageLoop.delete(id);
}

export default deleteRoom;
