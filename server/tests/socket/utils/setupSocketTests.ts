import type { IO, IOClientSocket } from "#types/socket.ts";
import createIO, { assignSingletonIO } from "#utils/io.ts";
import { config } from "dotenv";
import { createServer, type Server } from "http";
import { io as createClient } from "socket.io-client";

config();

interface TestKit {
  io: IO;
  server: Server;
  createAuthClient: (accessToken: string) => IOClientSocket;
  cleanup: () => Promise<void>;
  PORT: number;
}

const PORT = +(process.env.PORT || 7000);

async function setupSocketTests(): Promise<TestKit> {
  const server = createServer();
  const io = createIO(server);

  await new Promise<void>(res => server.listen(PORT, res));
  const activeClientSockets: IOClientSocket[] = [];

  const createAuthClient = (accessToken: string): IOClientSocket => {
    const client = createClient(`http://localhost:${PORT}`, {
      transports: ["websocket"],
      auth: { accessToken },
      forceNew: true,
    });

    activeClientSockets.push(client);
    return client;
  };

  const cleanup = async () => {
    activeClientSockets.forEach(clientSocket => clientSocket.disconnect());

    await new Promise(res => io.close(() => res(assignSingletonIO())));
    await new Promise<void>(res => server.close(() => res()));
  };

  return { io, server, createAuthClient, cleanup, PORT };
}

export default setupSocketTests;
