import roomsCleanupLoop from "#cleanup/roomsCleanupLoop.ts";
import type { IO } from "#types/socket.ts";
import initSocket from "#utils/initSocket.ts";
import socketAuthMiddlewareWithErrorHandling from "#utils/socketAuthMiddlewareWithErrorHandling.ts";
import {
  SocketEvents,
  type SocketClientToServerEvents,
  type SocketServerToClientEvents,
} from "@speak-up/shared";
import type { Server as HTTPServer } from "http";
import { Server } from "socket.io";

let singletonIo: IO | undefined;

function createIO(server: HTTPServer): IO;
function createIO(): IO | undefined;

function createIO(server?: HTTPServer): IO | undefined {
  if (singletonIo) return singletonIo;
  if (!server) return;

  const io = new Server<SocketClientToServerEvents, SocketServerToClientEvents>(
    server,
    {
      transports: ["websocket"],
      allowUpgrades: true,
      pingInterval: 10000,
      pingTimeout: 5000,
      maxHttpBufferSize: 1e6, // 1MB
      // does nothing ("polling"-only) but let it be
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
      // the actual semi-"CORS Policy"
      allowRequest: (req, cb) => {
        const origin = req.headers.origin;

        if (!origin || origin === process.env.CLIENT_URL) {
          cb(null, true);
        } else {
          cb("Forbidden", false);
        }
      },
      serveClient: false,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    },
  );

  io.use((socket, next) =>
    socketAuthMiddlewareWithErrorHandling(io, socket, next),
  ).on(SocketEvents.CONNECTION, socket => initSocket(socket, io));

  if (process.env.NODE_ENV !== "test") {
    io.once(SocketEvents.CONNECTION, () => roomsCleanupLoop(io));
  }

  singletonIo = io;
  return io;
}

export function assignSingletonIO(io?: IO): IO | undefined {
  singletonIo = io;
  return io;
}

export default createIO;
