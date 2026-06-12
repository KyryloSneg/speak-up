import type { IOSocketEventHandler } from "#types/socket.ts";
import emitCatchedErrorOfEventHandler from "#utils/emitCatchedErrorOfEventHandler.ts";
import type { SocketResponseEventsValue } from "@speak-up/shared";

type Handler<IsAuth extends boolean> = IOSocketEventHandler<IsAuth>;

// IsAuth is inferred automatically
function catchEventHandlerErrorDecorator<IsAuth extends boolean = false>(
  handler: Handler<IsAuth>,
  responseEvent: SocketResponseEventsValue,
): (
  ...args: Parameters<Handler<IsAuth>>
) => Promise<ReturnType<Handler<IsAuth>> | void> {
  return async (io, socket, ...args) => {
    try {
      return await handler(io, socket, ...args);
    } catch (e) {
      emitCatchedErrorOfEventHandler(socket, responseEvent, e as Error);
    }
  };
}

export default catchEventHandlerErrorDecorator;
