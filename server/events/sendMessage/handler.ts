import messageLoop from "#events/sendMessage/messageLoop.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import pushIncomingMessages from "#utils/pushIncomingMessages.ts";
import {
  getZodSendMessageDataValidation,
  SocketResponseEvents,
} from "@speak-up/shared";

async function sendMessageEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string, tempId?: string): void {
    socket.emit(SocketResponseEvents.SEND_MESSAGE, {
      error,
      tempId,
    });
  }

  const validationResult =
    getZodSendMessageDataValidation().safeParse(unvalidatedData);

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
  pushIncomingMessages(
    roomId,
    data.map(message => ({ ...message, socket })),
  );

  await messageLoop(io, roomId);
}

const sendMessageEventHandler = catchEventHandlerErrorDecorator(
  sendMessageEventHandlerCb,
  SocketResponseEvents.SEND_MESSAGE,
);

export default sendMessageEventHandler;
