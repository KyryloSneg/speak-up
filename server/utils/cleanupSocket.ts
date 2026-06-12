import type { IO, IOSocket } from "#types/socket.ts";
import leaveRoom from "#utils/leaveRoom.ts";
import rooms from "#utils/rooms.ts";

async function cleanupSocket(io: IO, socket: IOSocket<true>): Promise<void> {
  const roomsSnapshot = [...socket.rooms];

  const actualRooms = roomsSnapshot.filter(room => rooms.has(room));
  const miscRooms = roomsSnapshot.filter(
    // do not leave from the default socket.id room
    room => !actualRooms.includes(room) && room !== socket.id,
  );

  for (const room of actualRooms) {
    // this fn is in the race condition with socket.io rooms auto cleanup,
    // so we have to explicitly tell which room we want to leave
    await leaveRoom(io, socket, { roomIdToLeave: room });
  }

  for (const room of miscRooms) {
    socket.leave(room);
  }
}

export default cleanupSocket;
