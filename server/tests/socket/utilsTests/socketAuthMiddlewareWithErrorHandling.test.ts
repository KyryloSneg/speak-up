import ApiError from "#errors/ApiError.ts";
import socketAuthMiddleware from "#middlewares/socket/socketAuthMiddleware.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import socketAuthMiddlewareWithErrorHandling from "#utils/socketAuthMiddlewareWithErrorHandling.ts";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import type { Event } from "socket.io";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#middlewares/socket/socketAuthMiddleware.ts", () => ({
  default: vi.fn(),
}));

describe("socketAuthMiddlewareWithErrorHandling", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  const socketEvent = SocketEvents.CREATE_ROOM;
  const responseEvent = SocketResponseEvents.CREATE_ROOM;

  setupDbCleanup();
  beforeEach(async () => {
    vi.resetAllMocks();
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  async function testCatchedError(
    event: string,
    error: Error,
    expectedErrorMessage: string = error.message,
  ): Promise<void> {
    vi.mocked(socketAuthMiddleware).mockRejectedValue(error);
    const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());

    const clientSocket = testKit.createAuthClient(tokens.accessToken);
    await waitForClientSocketsConnect(clientSocket);

    const serverSocket = getServerSocket(testKit.io, clientSocket.id);
    if (!serverSocket) throw new Error("Server socket isn't defined");

    const isToExpectErrorResponse = event in SocketResponseEvents;
    const clientSocketEventDataOptionalPromise = isToExpectErrorResponse
      ? waitFor(clientSocket, responseEvent)
      : null;

    const next = vi.fn();
    await socketAuthMiddlewareWithErrorHandling(
      testKit.io,
      serverSocket,
      event as unknown as Event,
      next,
    );

    expect(socketAuthMiddleware).toHaveBeenCalledWith(
      testKit.io,
      serverSocket,
      next,
    );

    expect(next).toHaveBeenCalledWith(error);

    if (isToExpectErrorResponse) {
      expect(await clientSocketEventDataOptionalPromise).toStrictEqual({
        error: expectedErrorMessage,
      });
    }
  }

  it("should properly call auth middleware, call next fn with the thrown error and emit a correct socket response with ApiError's message if an ApiError instance was thrown inside auth middleware", async () => {
    await testCatchedError(
      socketEvent,
      ApiError.BadRequest("Something went wrong"),
    );
  });

  it("should properly call auth middleware, call next fn with the thrown error and emit a correct socket response with ApiError's message if an ApiError instance was thrown inside auth middleware", async () => {
    await testCatchedError(
      responseEvent,
      ApiError.BadRequest("Something went wrong"),
    );
  });

  it("should properly call auth middleware, call next fn with the thrown error and emit a correct socket response with fallback Unexpected Error message if a non-ApiError was thrown inside auth middleware", async () => {
    await testCatchedError(
      socketEvent,
      new Error("Unexpected error"),
      SocketResponseErrorMessages.UNEXPECTED_ERROR,
    );
  });
});
