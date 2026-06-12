import type { IO, IOSocket } from "#types/socket.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import leaveRoom from "#utils/leaveRoom.ts";
import { SocketResponseEvents } from "@speak-up/shared";

async function leaveRoomSocketHandlerCb(
  io: IO,
  socket: IOSocket<true>,
): Promise<void> {
  await leaveRoom(io, socket, { isToNotifyTargetSocket: true });
}

const leaveRoomSocketHandler = catchEventHandlerErrorDecorator(
  leaveRoomSocketHandlerCb,
  SocketResponseEvents.LEAVE_ROOM,
);

export default leaveRoomSocketHandler;
