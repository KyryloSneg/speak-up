import type { IOSocket } from "#types/socket.ts";

function checkIsSocketInRoom(socket: IOSocket, rooms: string[]): boolean {
  const isSocketInRoom = [...socket.rooms].some(room => rooms.includes(room));
  return isSocketInRoom;
}

export default checkIsSocketInRoom;
