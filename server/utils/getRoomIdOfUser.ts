import getRoomSockets from "#services/getRoomSockets.ts";
import type { IO, IOSocket } from "#types/socket.ts";
import getUserRoom from "#utils/getUserRoom.ts";
import rooms from "#utils/rooms.ts";

async function getRoomIdOfUser(
  io: IO,
  socket: IOSocket<true>,
): Promise<string | undefined> {
  const userRoom = getUserRoom(socket.data.userId);
  const userSockets = await getRoomSockets(io, userRoom);

  const userSocketRooms = userSockets
    .map(userSocket => Array.from(userSocket.rooms.values()))
    .flat();

  const roomId = userSocketRooms.find(id => rooms.has(id));
  return roomId;
}

export default getRoomIdOfUser;
