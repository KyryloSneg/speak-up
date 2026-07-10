import getRoomUsers from "#services/getRoomUsers.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import rooms from "#utils/rooms.ts";
import type { Message } from "@speak-up/shared";
import {
  getZodSendMessageDataValidation,
  SocketEvents,
  SocketResponseEvents,
} from "@speak-up/shared";
import { nanoid } from "nanoid";

async function sendMessageEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string): void {
    socket.emit(SocketResponseEvents.SEND_MESSAGE, {
      error,
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
  const users = await getRoomUsers(io, socket.id);

  if (!users.length) {
    // basically, a server error
    emitErrorEvent(SocketResponseErrorMessages.UNEXPECTED_ERROR);
    return;
  }

  const user = users[0];
  const message: Message = {
    id: nanoid(),
    userId: socket.data.userId,
    user: { nickname: user.nickname, picture: user.picture },
    content: data.content,
    createdAt: new Date().toISOString(),
  };

  const room = rooms.get(roomId);
  room?.messages.push(message);

  socket.emit(SocketResponseEvents.SEND_MESSAGE, { message });
  emitRoomEvent(
    io,
    roomId,
    SocketEvents.RECEIVED_MESSAGE,
    [{ message }],
    [socket.id],
  );
}

const sendMessageEventHandler = catchEventHandlerErrorDecorator(
  sendMessageEventHandlerCb,
  SocketResponseEvents.SEND_MESSAGE,
);

export default sendMessageEventHandler;
