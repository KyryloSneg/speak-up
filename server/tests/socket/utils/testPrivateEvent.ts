import ApiError from "#errors/ApiError.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import type { IOSocket } from "#types/socket.ts";
import {
  type SocketClientToServerEvents,
  type SocketResponseEvents,
} from "@speak-up/shared";
import { io as createClient } from "socket.io-client";
import { describe, expect, it } from "vitest";

function testPrivateEvent<Event extends keyof SocketClientToServerEvents>(
  getTestKit: () => Awaited<ReturnType<typeof setupSocketTests>>,
  event: Event,
  responseEvent: (typeof SocketResponseEvents)[keyof typeof SocketResponseEvents],
  ...data: Parameters<SocketClientToServerEvents[Event]>
): void {
  describe(`private event checks of ${event}`, () => {
    function testErrorRes(serverSocket: IOSocket<true>, res: unknown): void {
      expect(res).toStrictEqual({
        error: ApiError.UnauthorizedError().message,
      });

      expect(serverSocket?.data?.userId).toBeUndefined();
    }

    it("should disallow exchanging event messages if accessToken isn't provided", async () => {
      const testKit = getTestKit();
      const clientSocket = createClient(`http://localhost:${testKit.PORT}`, {
        transports: ["websocket"],
        forceNew: true,
      });

      await waitForClientSocketsConnect(clientSocket);

      const serverSocket = getServerSocket<true>(testKit.io, clientSocket.id);
      if (!serverSocket) throw new Error("Server socket isn't defined");

      const clientSocketEventPromise = waitFor(clientSocket, responseEvent);
      clientSocket.emit(event, ...data);

      const res = await clientSocketEventPromise;
      testErrorRes(serverSocket, res);
    });

    it("should disallow exchanging event messages if an invalid accessToken is provided", async () => {
      const testKit = getTestKit();

      const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
      const clientSocket = testKit.createAuthClient(
        `${tokens.accessToken}corrupted`,
      );

      await waitForClientSocketsConnect(clientSocket);

      const clientSocketEventPromise = waitFor(clientSocket, responseEvent);
      clientSocket.emit(event, ...data);

      const serverSocket = getServerSocket<true>(testKit.io, clientSocket.id);
      if (!serverSocket) throw new Error("Server socket isn't defined");

      const res = await clientSocketEventPromise;
      testErrorRes(serverSocket, res);
    });
  });
}

export default testPrivateEvent;
