import type { IO, IOSocket } from "#types/socket.ts";

async function getRoomSockets<IsAuth extends boolean = false>(
  io: IO,
  room: string,
): Promise<IOSocket<IsAuth>[]> {
  const sockets = await io.in(room).fetchSockets();
  return sockets as unknown as IOSocket<IsAuth>[];
}

export default getRoomSockets;
