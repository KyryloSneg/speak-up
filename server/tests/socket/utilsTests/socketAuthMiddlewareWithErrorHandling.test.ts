import ApiError from "#errors/ApiError.ts";
import socketAuthMiddleware from "#middlewares/socket/socketAuthMiddleware.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import { SocketAuthConnectionErrorCode } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#middlewares/socket/socketAuthMiddleware.ts", () => ({
  default: vi.fn(),
}));

describe("socketAuthMiddlewareWithErrorHandling", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    vi.resetAllMocks();
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  async function testCatchedError(
    error: Error,
    expectedErrorMessage: string = error.message,
  ): Promise<void> {
    vi.mocked(socketAuthMiddleware).mockRejectedValue(error);

    const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
    const clientSocket = testKit.createAuthClient(tokens.accessToken);

    const connectResponses = await waitForClientSocketsConnect(clientSocket);
    expect(socketAuthMiddleware).toHaveBeenCalled();

    connectResponses.forEach(res =>
      expect(res).toMatchObject({
        message: expectedErrorMessage,
        data: expect.objectContaining({
          code: SocketAuthConnectionErrorCode,
        }),
      }),
    );

    const serverSocket = getServerSocket(testKit.io, clientSocket.id);
    expect(serverSocket).toBeUndefined();
  }

  it("should properly call auth middleware, call next fn with an error a correct socket connect_error response with ApiError's message if an ApiError instance was thrown inside auth middleware", async () => {
    await testCatchedError(ApiError.BadRequest("Something went wrong"));
  });

  it("should properly call auth middleware, call next fn with an error a correct socket connect_error response with ApiError's message if an ApiError instance was thrown inside auth middleware", async () => {
    await testCatchedError(ApiError.BadRequest("Something went wrong"));
  });

  it("should properly call auth middleware, call next fn with an error a correct socket connect_error response with fallback Unexpected Error message if a non-ApiError was thrown inside auth middleware", async () => {
    await testCatchedError(
      new Error("Unexpected error"),
      SocketResponseErrorMessages.UNEXPECTED_ERROR,
    );
  });
});
