import ApiError from "#errors/ApiError.ts";
import type { IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import type { SocketResponseEventsValue } from "@speak-up/shared";

function emitCatchedErrorOfEventHandler(
  socket: IOSocket,
  responseEvent: SocketResponseEventsValue,
  e: Error,
): void {
  const error =
    e instanceof ApiError
      ? e.message
      : SocketResponseErrorMessages.UNEXPECTED_ERROR;

  socket.emit(responseEvent, { error });
}

export default emitCatchedErrorOfEventHandler;
