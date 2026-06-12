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
import socketAuthMiddlewareWithErrorHandling from "#utils/socketAuthMiddlewareWithErrorHandling.ts";
import { SocketEvents } from "@speak-up/shared";

function initSocket(socket: IOSocket, io: IO): void {
  socket
    .use((e, next) =>
      socketAuthMiddlewareWithErrorHandling(io, socket, e, next),
    )
    .on(SocketEvents.CREATE_ROOM, data =>
      createRoomEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.JOIN_ROOM, data =>
      joinRoomEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.SEND_MEDIA_CONFIG, data =>
      sendMediaConfigEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.SEND_SDP, data =>
      sendSDPEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.SEND_ICE, data =>
      sendIceEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.REMOVE_USER, data =>
      removeUserEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.LEAVE_ROOM, () =>
      leaveRoomSocketHandler(io, socket as IOSocket<true>),
    )
    .on(SocketEvents.SEND_MESSAGE, data =>
      sendMessageEventHandler(io, socket as IOSocket<true>, data),
    )
    .on(SocketEvents.DISCONNECTING, () =>
      cleanupSocket(io, socket as IOSocket<true>),
    );
}

export default initSocket;
