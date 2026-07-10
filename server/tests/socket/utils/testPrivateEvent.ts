import ApiError from "#errors/ApiError.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import {
  SocketAuthConnectionErrorCode,
  type SocketClientToServerEvents,
} from "@speak-up/shared";
import { io as createClient } from "socket.io-client";
import { describe, expect, it } from "vitest";

function testPrivateEvent<Event extends keyof SocketClientToServerEvents>(
  getTestKit: () => Awaited<ReturnType<typeof setupSocketTests>>,
  event: Event,
): void {
  describe(`private event checks of ${event}`, () => {
    function testErrorRes(res: unknown): void {
      expect(res).toMatchObject({
        message: ApiError.UnauthorizedError().message,
        data: expect.objectContaining({
          code: SocketAuthConnectionErrorCode,
        }),
      });
    }

    it("should disallow exchanging event messages if accessToken isn't provided", async () => {
      const testKit = getTestKit();
      const clientSocket = createClient(`http://localhost:${testKit.PORT}`, {
        transports: ["websocket"],
        forceNew: true,
      });

      const connectResponses = await waitForClientSocketsConnect(clientSocket);
      connectResponses.forEach(res => testErrorRes(res));

      const serverSocket = getServerSocket<true>(testKit.io, clientSocket.id);
      expect(serverSocket).toBeUndefined();
    });

    it("should disallow exchanging event messages if an invalid accessToken is provided", async () => {
      const testKit = getTestKit();

      const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
      const clientSocket = testKit.createAuthClient(
        `${tokens.accessToken}corrupted`,
      );

      const connectResponses = await waitForClientSocketsConnect(clientSocket);
      connectResponses.forEach(res => testErrorRes(res));

      const serverSocket = getServerSocket<true>(testKit.io, clientSocket.id);
      expect(serverSocket).toBeUndefined();
    });
  });
}

export default testPrivateEvent;
