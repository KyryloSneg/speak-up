import type { Room } from "#types/room.ts";

const roomToIsProcessingMessageLoop: Map<Room["id"], boolean> = new Map();
export default roomToIsProcessingMessageLoop;
