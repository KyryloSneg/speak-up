import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import rooms from "#utils/rooms.ts";
import {
  getZodSendMediaConfigDataValidation,
  SocketEvents,
  SocketResponseEvents,
} from "@speak-up/shared";

async function sendMediaConfigEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string): void {
    socket.emit(SocketResponseEvents.SEND_MEDIA_CONFIG, {
      error,
    });
  }

  const validationResult =
    getZodSendMediaConfigDataValidation().safeParse(unvalidatedData);

  if (!validationResult.success) {
    emitErrorEvent(SocketResponseErrorMessages.INVALID_DATA);
    return;
  }

  const roomId = await getRoomIdOfUser(io, socket);
  if (!roomId) {
    emitErrorEvent(SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM);
    return;
  }

  const data = validationResult.data;
  const room = rooms.get(roomId);

  room?.mediaConfigs.set(socket.data.userId, data.config);

  emitRoomEvent(
    io,
    roomId,
    SocketEvents.RECEIVED_MEDIA_CONFIG,
    [{ userId: socket.data.userId, config: data.config }],
    [socket.id],
  );
}

const sendMediaConfigEventHandler = catchEventHandlerErrorDecorator(
  sendMediaConfigEventHandlerCb,
  SocketResponseEvents.SEND_MEDIA_CONFIG,
);

export default sendMediaConfigEventHandler;
