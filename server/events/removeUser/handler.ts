import getRoomSockets from "#services/getRoomSockets.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import leaveRoom from "#utils/leaveRoom.ts";
import rooms from "#utils/rooms.ts";
import {
  getZodRemoveUserDataValidation,
  SocketResponseEvents,
} from "@speak-up/shared";

async function removeUserEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string): void {
    socket.emit(SocketResponseEvents.REMOVE_USER, {
      error,
    });
  }

  const validationResult =
    getZodRemoveUserDataValidation().safeParse(unvalidatedData);

  if (!validationResult.success) {
    emitErrorEvent(SocketResponseErrorMessages.INVALID_DATA);
    return;
  }

  const roomId = await getRoomIdOfUser(io, socket);
  if (!roomId) {
    emitErrorEvent(SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM);
    return;
  }

  const room = rooms.get(roomId);
  if (room?.hostId !== socket.data.userId) {
    emitErrorEvent(SocketResponseErrorMessages.NOT_HOST);
    return;
  }

  const data = validationResult.data;
  if (room?.hostId === data.userId) {
    emitErrorEvent(SocketResponseErrorMessages.CANT_REMOVE_YOURSELF);
    return;
  }

  const roomSockets = await getRoomSockets<true>(io, roomId);
  const socketOfUserToRemove = roomSockets.find(
    socket => socket.data.userId === data.userId,
  );

  room?.removedUserIds.add(data.userId);
  if (!socketOfUserToRemove) return;

  await leaveRoom(io, socketOfUserToRemove, { isToNotifyTargetSocket: true });
}

const removeUserEventHandler = catchEventHandlerErrorDecorator(
  removeUserEventHandlerCb,
  SocketResponseEvents.REMOVE_USER,
);

export default removeUserEventHandler;
