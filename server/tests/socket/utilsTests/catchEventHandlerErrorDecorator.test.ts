import ApiError from "#errors/ApiError.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { IOSocketEventHandler } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import catchEventHandlerErrorDecorator from "#utils/catchEventHandlerErrorDecorator.ts";
import { SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("catchEventHandlerErrorDecorator", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;
  const responseEvent = SocketResponseEvents.CREATE_ROOM;

  setupDbCleanup();
  beforeEach(async () => {
    vi.clearAllMocks();
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  async function testCatchedError(
    error: Error,
    expectedErrorMessage: string = error.message,
  ): Promise<void> {
    const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());

    const clientSocket = testKit.createAuthClient(tokens.accessToken);
    await waitForClientSocketsConnect(clientSocket);

    const serverSocket = getServerSocket(testKit.io, clientSocket.id);
    if (!serverSocket) throw new Error("Server socket isn't defined");

    const handler: IOSocketEventHandler = vi.fn(() => {
      throw error;
    });

    const clientSocketEventDataPromise = waitFor(clientSocket, responseEvent);
    const handlerWithErrorHandling = catchEventHandlerErrorDecorator(
      handler,
      responseEvent,
    );

    const args = [testKit.io, serverSocket, {}] as const;
    await handlerWithErrorHandling(...args);

    expect(handler).toHaveBeenCalledWith(...args);
    expect(await clientSocketEventDataPromise).toStrictEqual({
      error: expectedErrorMessage,
    });
  }

  it("should emit a proper socket response with ApiError's message if an ApiError instance was thrown inside an event handler", async () => {
    await testCatchedError(ApiError.BadRequest("Something went wrong"));
  });

  it("should emit a proper socket response with fallback Unexpected Error message if a non-ApiError was thrown inside an event handler", async () => {
    await testCatchedError(
      new Error("Unexpected error"),
      SocketResponseErrorMessages.UNEXPECTED_ERROR,
    );
  });
});
