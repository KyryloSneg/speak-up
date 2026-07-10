import ApiError from "#errors/ApiError.ts";
import socketAuthMiddleware from "#middlewares/socket/socketAuthMiddleware.ts";
import type { IO, IOSocket, IOSocketNextFunction } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import {
  SocketAuthConnectionErrorCode,
  type SocketAuthConnectionError,
} from "@speak-up/shared";

async function socketAuthMiddlewareWithErrorHandling(
  io: IO,
  socket: IOSocket,
  next: IOSocketNextFunction,
): Promise<ReturnType<typeof socketAuthMiddleware> | void> {
  try {
    return await socketAuthMiddleware(io, socket, next);
  } catch (e) {
    const authError = {
      message:
        e instanceof ApiError
          ? e.message
          : SocketResponseErrorMessages.UNEXPECTED_ERROR,
      data: { code: SocketAuthConnectionErrorCode },
    } as SocketAuthConnectionError;

    next(authError);
  }
}

export default socketAuthMiddlewareWithErrorHandling;
