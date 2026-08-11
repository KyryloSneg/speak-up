import createRoomEventHandler from "#events/createRoom/handler.ts";
import joinRoomEventHandler from "#events/joinRoom/handler.ts";
import leaveRoomSocketHandler from "#events/leaveRoom/handler.ts";
import removeUserEventHandler from "#events/removeUser/handler.ts";
import sendIceEventHandler from "#events/sendIce/handler.ts";
import sendMediaConfigEventHandler from "#events/sendMediaConfig/handler.ts";
import sendMessageEventHandler from "#events/sendMessage/handler.ts";
import sendSDPEventHandler from "#events/sendSDP/handler.ts";
import getRoomSockets from "#services/getRoomSockets.ts";
import type { Room } from "#types/room.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import cleanupSocket from "#utils/cleanupSocket.ts";
import deleteRoom from "#utils/deleteRoom.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import rejoiningUserToRoomId from "#utils/rejoiningUserToRoomId.ts";
import rooms from "#utils/rooms.ts";
import { SocketEvents } from "@speak-up/shared";

async function initSocket(socket: IOSocket<true>, io: IO): Promise<void> {
  let isAuthDisconnect = false;

  const authUserLifetimeMs = socket.data.expired * 1000 - Date.now();
  const disconnectTimeoutId = setTimeout(() => {
    isAuthDisconnect = true;
    socket.disconnect(true);
  }, authUserLifetimeMs).unref();

  socket
    .on(SocketEvents.CREATE_ROOM, data =>
      createRoomEventHandler(io, socket, data),
    )
    .on(SocketEvents.JOIN_ROOM, data => joinRoomEventHandler(io, socket, data))
    .on(SocketEvents.SEND_MEDIA_CONFIG, data =>
      sendMediaConfigEventHandler(io, socket, data),
    )
    .on(SocketEvents.SEND_SDP, data => sendSDPEventHandler(io, socket, data))
    .on(SocketEvents.SEND_ICE, data => sendIceEventHandler(io, socket, data))
    .on(SocketEvents.REMOVE_USER, data =>
      removeUserEventHandler(io, socket, data),
    )
    .on(SocketEvents.LEAVE_ROOM, () => leaveRoomSocketHandler(io, socket))
    .on(SocketEvents.SEND_MESSAGE, data =>
      sendMessageEventHandler(io, socket, data),
    )
    .on(SocketEvents.DISCONNECTING, () => {
      if (isAuthDisconnect) {
        isAuthDisconnect = false;

        const roomId = [...socket.rooms].find(room => rooms.has(room));
        if (roomId) {
          rejoiningUserToRoomId.set(socket.data.userId, {
            id: roomId,
            createdAt: new Date(),
          });
        }
      } else {
        cleanupSocket(io, socket);
      }
    })
    .on(SocketEvents.DISCONNECT, () => clearTimeout(disconnectTimeoutId));

  // try to rejoin the room
  const roomId = rejoiningUserToRoomId.get(socket.data.userId)?.id;
  const room = roomId ? rooms.get(roomId) : null;

  if (roomId && room && !room.removedUserIds.has(socket.data.userId)) {
    socket.join(roomId);
  } else if (roomId) {
    // make sure that this user leaves the room on the client side
    // from the perspective of both users in room and our target
    socket.emit(SocketEvents.LEFT_ROOM, { id: roomId });
    emitRoomEvent(io, roomId, SocketEvents.USER_LEFT, [
      { userId: socket.data.userId },
    ]);

    async function optionallyCleanupRoom(roomId: Room["id"]): Promise<void> {
      const roomSockets = await getRoomSockets(io, roomId);
      if (!roomSockets.length) deleteRoom(roomId);
    }

    optionallyCleanupRoom(roomId);
  }

  rejoiningUserToRoomId.delete(socket.data.userId);
}

export default initSocket;
