import type { IOClientSocket } from "#types/socket.ts";

function waitFor(
  clientSocket: IOClientSocket,
  event: string,
): Promise<unknown> {
  return new Promise(res => {
    clientSocket.once(event as any, res);
  });
}

export default waitFor;
