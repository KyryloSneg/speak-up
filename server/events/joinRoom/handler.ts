import getRoomSockets from "#services/getRoomSockets.ts";
import getRoomUsers from "#services/getRoomUsers.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import getUserRoom from "#utils/getUserRoom.ts";
import leaveRoom from "#utils/leaveRoom.ts";
import rooms from "#utils/rooms.ts";
import {
  getZodJoinRoomDataValidation,
  SocketEvents,
  SocketResponseEvents,
} from "@speak-up/shared";

async function joinRoomEventHandlerCb(
  io: IO,
  socket: IOSocket<true>,
  unvalidatedData: unknown,
): Promise<void> {
  function emitErrorEvent(error: string): void {
    socket.emit(SocketResponseEvents.JOIN_ROOM, {
      error,
    });
  }

  const validationResult =
    getZodJoinRoomDataValidation().safeParse(unvalidatedData);

  if (!validationResult.success) {
    emitErrorEvent(SocketResponseErrorMessages.INVALID_DATA);
    return;
  }

  const data = validationResult.data;
  const userRoom = getUserRoom(socket.data.userId);

  const room = rooms.get(data.id);
  if (!room) {
    emitErrorEvent(SocketResponseErrorMessages.ROOM_DOESNT_EXIST);
    return;
  }

  if (room.removedUserIds.has(socket.data.userId)) {
    emitErrorEvent(SocketResponseErrorMessages.CANT_JOIN_ROOM);
    return;
  }

  const roomSockets = await getRoomSockets<true>(io, data.id);
  const userSockets = await getRoomSockets<true>(io, userRoom);

  // just in case
  if (room.removedUserIds.has(socket.data.userId)) {
    emitErrorEvent(SocketResponseErrorMessages.CANT_JOIN_ROOM);
    return;
  }

  const joinedUserSocket = roomSockets.find(roomSocket =>
    userSockets.includes(roomSocket),
  );

  if (joinedUserSocket === socket) return;

  // if we are going to join the same room from a different socket,
  // kick the previous socket out silently
  const isLoudRoomLeave = !joinedUserSocket;
  await leaveRoom(io, socket, {
    isToNotifyRoom: isLoudRoomLeave,
    isToNotifyTargetSocket: true,
    isToDeleteRoomOnEmpty: isLoudRoomLeave,
  });

  // if we are going to a brand new room, check .maxMembers boundary
  if (isLoudRoomLeave && roomSockets.length >= room.maxMembers) {
    emitErrorEvent(SocketResponseErrorMessages.FULL_ROOM);
    return;
  }

  socket.join(data.id);

  let userDtos;
  try {
    userDtos = await getRoomUsers(io, data.id);
  } catch (e) {
    socket.leave(data.id);
    throw e;
  }

  socket.emit(SocketResponseEvents.JOIN_ROOM, {
    hostId: room.hostId,
    users: userDtos,
    messages: room.messages,
    maxMembers: room.maxMembers,
  });

  if (isLoudRoomLeave) {
    const userDto = userDtos.find(dto => dto.id === socket.data.userId);
    emitRoomEvent(
      io,
      data.id,
      SocketEvents.USER_JOINED,
      [{ user: userDto! }],
      [socket.id],
    );
  }
}

const joinRoomEventHandler = catchEventHandlerErrorDecorator(
  joinRoomEventHandlerCb,
  SocketResponseEvents.JOIN_ROOM,
);

export default joinRoomEventHandler;
