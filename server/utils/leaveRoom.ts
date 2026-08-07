import getRoomSockets from "#services/getRoomSockets.ts";
import type { Room } from "#types/room.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import deleteRoom from "#utils/deleteRoom.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import getUserRoom from "#utils/getUserRoom.ts";
import rooms from "#utils/rooms.ts";
import { SocketEvents } from "@speak-up/shared";

export interface LeaveRoomOptions {
  isToNotifyRoom?: boolean;
  isToNotifyTargetSocket?: boolean;
  roomIdToLeave?: string;
  isToDeleteRoomOnEmpty?: boolean;
}

export const defaultLeaveRoomOptions: LeaveRoomOptions = {
  isToNotifyRoom: true,
  isToDeleteRoomOnEmpty: true,
} as const;

async function leaveRoom(
  io: IO,
  socket: IOSocket<true>,
  options: LeaveRoomOptions = defaultLeaveRoomOptions,
): Promise<Room | undefined> {
  const optionsToUse = { ...defaultLeaveRoomOptions, ...options } as const;
  const roomIdToLeave =
    optionsToUse.roomIdToLeave || (await getRoomIdOfUser(io, socket));

  if (!roomIdToLeave) return;

  const userRoom = getUserRoom(socket.data.userId);
  const userSockets = await getRoomSockets(io, userRoom);

  userSockets.forEach(userSocket => {
    if (
      optionsToUse.isToNotifyTargetSocket &&
      userSocket.rooms.has(roomIdToLeave)
    ) {
      userSocket.emit(SocketEvents.LEFT_ROOM, {
        id: roomIdToLeave,
      });
    }

    userSocket.leave(roomIdToLeave);
  });

  const roomSockets = await getRoomSockets(io, roomIdToLeave);
  const leftRoom = rooms.get(roomIdToLeave);

  leftRoom?.mediaConfigs.delete(socket.data.userId);

  if (roomSockets.length) {
    if (optionsToUse.isToNotifyRoom) {
      emitRoomEvent(io, roomIdToLeave, SocketEvents.USER_LEFT, [
        {
          userId: socket.data.userId!,
        },
      ]);
    }
  } else if (optionsToUse.isToDeleteRoomOnEmpty) {
    deleteRoom(roomIdToLeave);
  }

  return leftRoom;
}

export default leaveRoom;
