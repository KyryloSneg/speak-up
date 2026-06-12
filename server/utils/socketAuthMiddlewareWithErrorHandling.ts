import socketAuthMiddleware from "#middlewares/socket/socketAuthMiddleware.ts";
import type { IO, IOSocket, IOSocketNextFunction } from "#types/socket.ts";
import emitCatchedErrorOfEventHandler from "#utils/emitCatchedErrorOfEventHandler.ts";
import {
  objectEntries,
  SocketEvents,
  SocketResponseEvents,
  type SocketEventsValue,
  type SocketResponseEventsKey,
} from "@speak-up/shared";
import type { Event } from "socket.io";

async function socketAuthMiddlewareWithErrorHandling(
  io: IO,
  socket: IOSocket,
  e: Event,
  next: IOSocketNextFunction,
): Promise<ReturnType<typeof socketAuthMiddleware> | void> {
  try {
    return await socketAuthMiddleware(io, socket, next);
  } catch (error) {
    // this catch cb is retarded
    const errorToPass = error as Error;

    if (!(Object.values(SocketEvents) as string[]).includes(e[0])) {
      next(errorToPass);
      return;
    }

    const eventName = e[0] as SocketEventsValue;
    const eventKey = objectEntries(SocketEvents).find(
      ([_, name]) => name === eventName,
    )?.[0];

    if (!eventKey) {
      next(errorToPass);
      return;
    }

    if (eventKey in SocketResponseEvents) {
      const strictEventKey = eventKey as SocketResponseEventsKey;
      const responseEventName = SocketResponseEvents[strictEventKey];

      emitCatchedErrorOfEventHandler(socket, responseEventName, errorToPass);
    }

    next(errorToPass);
  }
}

export default socketAuthMiddlewareWithErrorHandling;
