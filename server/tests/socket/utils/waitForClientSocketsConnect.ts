import waitFor from "#tests/socket/utils/waitFor.ts";
import type { IOClientSocket } from "#types/socket.ts";

type ConnectResponse = unknown;

function waitForClientSocketsConnect(
  ...clientSockets: IOClientSocket[]
): Promise<ConnectResponse[]> {
  return Promise.all(
    clientSockets.map(clientSocket =>
      Promise.any([
        waitFor(clientSocket, "connect"),
        waitFor(clientSocket, "connect_error"),
      ]),
    ),
  );
}

export default waitForClientSocketsConnect;
