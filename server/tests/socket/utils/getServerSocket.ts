import type { IO, IOSocket } from "#types/socket.ts";

function getServerSocket<IsAuth extends boolean = false>(
  io: IO,
  id: string | undefined,
): IOSocket<IsAuth> | undefined {
  if (!id) return;

  const serverSocket = io.sockets.sockets.get(id);
  return serverSocket;
}

export default getServerSocket;
