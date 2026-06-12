import mapToUserDto from "#dtos/userDto.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import { mockUser } from "#tests/utils/consts.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { IOClientSocket, IOSocket } from "#types/socket.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import {
  SocketEvents,
  type SocketServerToClientEventsData,
} from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("emitUserEvent", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  async function setupSockets(): Promise<{
    room: string;
    clientSockets: {
      first: IOClientSocket;
      sec: IOClientSocket;
      third: IOClientSocket;
    };
    serverSockets: { first: IOSocket; sec: IOSocket; third: IOSocket };
  }> {
    const { tokens: firstUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { tokens: secUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { tokens: thirdUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const firstClientSocket = testKit.createAuthClient(
      firstUserTokens.accessToken,
    );

    const secClientSocket = testKit.createAuthClient(secUserTokens.accessToken);
    const thirdClientSocket = testKit.createAuthClient(
      thirdUserTokens.accessToken,
    );

    await waitForClientSocketsConnect(
      firstClientSocket,
      secClientSocket,
      thirdClientSocket,
    );

    const firstServerSocket = getServerSocket(testKit.io, firstClientSocket.id);
    const secServerSocket = getServerSocket(testKit.io, secClientSocket.id);
    const thirdServerSocket = getServerSocket(testKit.io, thirdClientSocket.id);

    if (!firstServerSocket || !secServerSocket || !thirdServerSocket) {
      throw new Error("Server sockets aren't defined");
    }

    const room = "test-room";

    firstServerSocket.join(room);
    secServerSocket.join(room);

    return {
      room,
      clientSockets: {
        first: firstClientSocket,
        sec: secClientSocket,
        third: thirdClientSocket,
      },
      serverSockets: {
        first: firstServerSocket,
        sec: secServerSocket,
        third: thirdServerSocket,
      },
    };
  }

  it("should properly emit a message to a whole room without emitting it to a 3rd-party client socket", async () => {
    const { room, clientSockets } = await setupSockets();
    const firstClientSocketEventDataPromise = waitFor(
      clientSockets.first,
      SocketEvents.USER_JOINED,
    );

    const secClientSocketEventDataPromise = waitFor(
      clientSockets.sec,
      SocketEvents.USER_JOINED,
    );

    let thirdClientSocketEventDataPresence = false;
    clientSockets.third.on(SocketEvents.USER_JOINED, () => {
      thirdClientSocketEventDataPresence = true;
    });

    const eventData: SocketServerToClientEventsData[typeof SocketEvents.USER_JOINED] =
      { user: mapToUserDto(mockUser) } as const;

    emitRoomEvent(testKit.io, room, SocketEvents.USER_JOINED, [eventData]);

    const [firstClientSocketEventData, secClientSocketEventData] =
      await Promise.all([
        firstClientSocketEventDataPromise,
        secClientSocketEventDataPromise,
      ]);

    expect(firstClientSocketEventData).toStrictEqual(eventData);
    expect(secClientSocketEventData).toStrictEqual(eventData);

    expect(thirdClientSocketEventDataPresence).toBe(false);
  });

  it("should properly emit a message to a whole room without emitting it to a 3rd-party client socket and an excluded client socket", async () => {
    const { room, clientSockets, serverSockets } = await setupSockets();
    const firstClientSocketEventDataPromise = waitFor(
      clientSockets.first,
      SocketEvents.USER_JOINED,
    );

    let secClientSocketEventDataPresence = false;
    clientSockets.sec.on(SocketEvents.USER_JOINED, () => {
      secClientSocketEventDataPresence = true;
    });

    let thirdClientSocketEventDataPresence = false;
    clientSockets.third.on(SocketEvents.USER_JOINED, () => {
      thirdClientSocketEventDataPresence = true;
    });

    const eventData: SocketServerToClientEventsData[typeof SocketEvents.USER_JOINED] =
      { user: mapToUserDto(mockUser) } as const;

    emitRoomEvent(
      testKit.io,
      room,
      SocketEvents.USER_JOINED,
      [eventData],
      [serverSockets.sec.id],
    );

    const firstClientSocketEventData = await firstClientSocketEventDataPromise;
    expect(firstClientSocketEventData).toStrictEqual(eventData);

    expect(secClientSocketEventDataPresence).toBe(false);
    expect(thirdClientSocketEventDataPresence).toBe(false);
  });
});
