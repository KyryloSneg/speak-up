import getRoomUsers from "#services/getRoomUsers.ts";
import type { Room } from "#types/room.ts";
import type { IO } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import removeIncomingMessages from "#utils/removeIncomingMessages.ts";
import rooms from "#utils/rooms.ts";
import roomToIncomingMessages from "#utils/roomToIncomingMessages.ts";
import roomToIsProcessingMessageLoop from "#utils/roomToIsProcessingMessageLoop.ts";
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
} from "@speak-up/shared";
import { nanoid } from "nanoid";

async function messageLoop(io: IO, roomId: Room["id"]): Promise<void> {
  // only one messageLoop running at the same moment for each room
  if (roomToIsProcessingMessageLoop.get(roomId)) return;

  const incomingMessages = roomToIncomingMessages.get(roomId) || [];
  if (!incomingMessages.length) return;

  roomToIsProcessingMessageLoop.set(roomId, true);

  for (const data of incomingMessages) {
    const socket = data.socket;

    function emitErrorEvent(error: string): void {
      socket.emit(SocketResponseEvents.SEND_MESSAGE, {
        error,
        tempId: data.tempId,
      });
    }

    try {
      const userRoomId = await getRoomIdOfUser(io, socket);
      if (!userRoomId) {
        emitErrorEvent(SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM);
        return;
      }

      if (userRoomId !== roomId) {
        emitErrorEvent(
          SocketResponseErrorMessages.CANT_SEND_MESSAGE_TO_OTHER_ROOM,
        );

        return;
      }

      const users = await getRoomUsers(io, socket.id);
      if (!users.length) {
        // basically, a server error
        emitErrorEvent(SocketResponseErrorMessages.UNEXPECTED_ERROR);
        return;
      }

      const user = users[0];
      const message: Message = {
        id: nanoid(),
        tempId: data.tempId,
        userId: socket.data.userId,
        user: { nickname: user.nickname, picture: user.picture },
        content: data.content,
        createdAt: new Date().toISOString(),
      };

      const room = rooms.get(roomId);
      if (!room) continue;

      room.messages.push(message);

      socket.emit(SocketResponseEvents.SEND_MESSAGE, { message });
      emitRoomEvent(
        io,
        roomId,
        SocketEvents.RECEIVED_MESSAGE,
        [{ message }],
        [socket.id],
      );
    } catch {
    } finally {
      removeIncomingMessages(roomId, [data]);
    }
  }

  roomToIsProcessingMessageLoop.set(roomId, false); // unlock the loop
  return await messageLoop(io, roomId);
}

export default messageLoop;
