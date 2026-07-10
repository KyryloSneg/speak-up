import type { User } from "#generated/prisma/client.ts";
import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@speak-up/shared";
import type { DefaultEventsMap, Server, Socket } from "socket.io";
import type { Socket as ClientSocket } from "socket.io-client";

type SocketData = { userId: User["id"]; expired: number };

export type IO = Server<SocketClientToServerEvents, SocketServerToClientEvents>;
export type IOSocket<IsAuth extends boolean = false> = Socket<
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  DefaultEventsMap,
  IsAuth extends true ? SocketData : Partial<SocketData>
>;

export type IOClientSocket = ClientSocket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
>;

export type IOSocketNextFunction = (error?: Error) => void;
export type IOSocketEventHandler<IsAuth extends boolean = false> = (
  io: IO,
  socket: IOSocket<IsAuth>,
  data?: unknown,
) => Promise<void> | void;
