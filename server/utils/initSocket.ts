import createRoomEventHandler from "#events/createRoom/handler.ts";
import joinRoomEventHandler from "#events/joinRoom/handler.ts";
import leaveRoomSocketHandler from "#events/leaveRoom/handler.ts";
import removeUserEventHandler from "#events/removeUser/handler.ts";
import sendIceEventHandler from "#events/sendIce/handler.ts";
import sendMediaConfigEventHandler from "#events/sendMediaConfig/handler.ts";
import sendMessageEventHandler from "#events/sendMessage/handler.ts";
import sendSDPEventHandler from "#events/sendSDP/handler.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import cleanupSocket from "#utils/cleanupSocket.ts";
import { SocketEvents } from "@speak-up/shared";

function initSocket(socket: IOSocket<true>, io: IO): void {
  const authUserLifetimeMs = socket.data.expired * 1000 - Date.now();
  const disconnectTimeoutId = setTimeout(
    () => socket.disconnect(true),
    authUserLifetimeMs,
  ).unref();

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
    .on(SocketEvents.DISCONNECTING, () => cleanupSocket(io, socket))
    .on(SocketEvents.DISCONNECT, () => clearTimeout(disconnectTimeoutId));
}

export default initSocket;
