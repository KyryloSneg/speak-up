import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import getRoomIdOfUser from "#utils/getRoomIdOfUser.ts";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("cleanupSocket", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  it("should properly identify room user is currently in", async () => {
    const { tokens: firstUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { tokens: secUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const firstClientSocket = testKit.createAuthClient(
      firstUserTokens.accessToken,
    );

    const secClientSocket = testKit.createAuthClient(
      firstUserTokens.accessToken,
    );

    const thirdClientSocket = testKit.createAuthClient(
      secUserTokens.accessToken,
    );

    await waitForClientSocketsConnect(
      firstClientSocket,
      secClientSocket,
      thirdClientSocket,
    );

    // emit actual events in order to hit auth middleware
    const firstClientSocketCreateRoomPromise = waitFor(
      firstClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    firstClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: 10,
      mediaConfig: { audio: true, video: true },
    });

    const room = ((await firstClientSocketCreateRoomPromise) as { id: string })
      .id;

    const secClientSocketSendMessagePromise = waitFor(
      secClientSocket,
      SocketResponseEvents.SEND_MESSAGE,
    );

    secClientSocket.emit(SocketEvents.SEND_MESSAGE, [
      {
        tempId: "tempId",
        content: [{ type: "text", value: "value" }],
      },
    ]);

    await secClientSocketSendMessagePromise;
    const thirdClientSocketSendMediaConfigPromise = waitFor(
      thirdClientSocket,
      SocketResponseEvents.SEND_MEDIA_CONFIG,
    );

    // error response incoming
    thirdClientSocket.emit(SocketEvents.SEND_MEDIA_CONFIG, {
      config: { audio: true, video: true },
    });

    await thirdClientSocketSendMediaConfigPromise;
    const firstServerSocket = getServerSocket<true>(
      testKit.io,
      firstClientSocket.id,
    );

    const secServerSocket = getServerSocket<true>(
      testKit.io,
      secClientSocket.id,
    );

    const thirdServerSocket = getServerSocket<true>(
      testKit.io,
      thirdClientSocket.id,
    );

    if (!firstServerSocket || !secServerSocket || !thirdServerSocket) {
      throw new Error("Servers sockets aren't defined");
    }

    const roomIdFromMainSocket = await getRoomIdOfUser(
      testKit.io,
      firstServerSocket,
    );

    const roomIdFromSecSocket = await getRoomIdOfUser(
      testKit.io,
      secServerSocket,
    );

    const roomIdFromClearSocket = await getRoomIdOfUser(
      testKit.io,
      thirdServerSocket,
    );

    expect(roomIdFromMainSocket).toBe(room);
    expect(roomIdFromSecSocket).toBe(room);
    expect(roomIdFromClearSocket).toBeUndefined();
  });
});
