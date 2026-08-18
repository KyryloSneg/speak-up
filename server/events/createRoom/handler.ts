import type { Room } from "#types/room.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import generateRoomId from "#utils/generateRoomId.ts";
import leaveRoom from "#utils/leaveRoom.ts";
import rooms from "#utils/rooms.ts";
import {
  getZodCreateRoomDataValidation,
  SocketResponseEvents,
} from "@speak-up/shared";

export async function createRoomEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string): void {
    socket.emit(SocketResponseEvents.CREATE_ROOM, {
      error,
    });
  }

  const validationResult =
    getZodCreateRoomDataValidation().safeParse(unvalidatedData);

  if (!validationResult.success) {
    emitErrorEvent(SocketResponseErrorMessages.INVALID_DATA);
    return;
  }

  await leaveRoom(io, socket, { isToNotifyTargetSocket: true });

  const data = validationResult.data;
  const room: Room = {
    id: generateRoomId(),
    hostId: socket.data.userId,
    removedUserIds: new Set(),
    messages: [],
    maxMembers: data.maxMembers,
    mediaConfigs: new Map([[socket.data.userId, data.mediaConfig]]),
  } as const;

  rooms.set(room.id, room);

  socket.join(room.id);
  socket.emit(SocketResponseEvents.CREATE_ROOM, {
    id: room.id,
  });
}

const createRoomEventHandler = catchEventHandlerErrorDecorator(
  createRoomEventHandlerCb,
  SocketResponseEvents.CREATE_ROOM,
);

export default createRoomEventHandler;
