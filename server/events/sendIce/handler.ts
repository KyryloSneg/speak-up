import getRoomSockets from "#services/getRoomSockets.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import {
  getZodSendIceDataValidation,
  SocketEvents,
  SocketResponseEvents,
} from "@speak-up/shared";

async function sendIceEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string): void {
    socket.emit(SocketResponseEvents.SEND_ICE, {
      error,
    });
  }

  const validationResult =
    getZodSendIceDataValidation().safeParse(unvalidatedData);

  if (!validationResult.success) {
    emitErrorEvent(SocketResponseErrorMessages.INVALID_DATA);
    return;
  }

  const data = validationResult.data;
  if (data.userId === socket.data.userId) {
    emitErrorEvent(
      SocketResponseErrorMessages.CANT_CREATE_CONNECTION_WITH_YOURSELF,
    );

    return;
  }

  const roomId = await getRoomIdOfUser(io, socket);
  if (!roomId) {
    emitErrorEvent(SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM);
    return;
  }

  const roomSockets = await getRoomSockets(io, roomId);
  const isSocketInRoom = roomSockets.some(
    roomSocket => socket.id === roomSocket.id,
  );

  if (!isSocketInRoom) {
    emitErrorEvent(SocketResponseErrorMessages.CANT_CREATE_NON_MAIN_CONNECTION);
    return;
  }

  const recipientSocket = roomSockets.find(
    roomSocket => roomSocket.data.userId === data.userId,
  );

  if (!recipientSocket) {
    emitErrorEvent(SocketResponseErrorMessages.USER_NOT_INSIDE_ROOM);
    return;
  }

  recipientSocket.emit(SocketEvents.RECEIVED_ICE, {
    userId: socket.data.userId,
    ice: data.ice,
  });
}

const sendIceEventHandler = catchEventHandlerErrorDecorator(
  sendIceEventHandlerCb,
  SocketResponseEvents.SEND_ICE,
);

export default sendIceEventHandler;
