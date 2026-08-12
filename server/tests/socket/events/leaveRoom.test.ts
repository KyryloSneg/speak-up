import type { User } from "#generated/prisma/client.ts";
import checkIsSocketInRoom from "#tests/socket/utils/checkIsSocketInRoom.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import testPrivateEvent from "#tests/socket/utils/testPrivateEvent.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import waitAfterEmit from "#tests/socket/utils/waitAfterEmit.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { IOClientSocket, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import rooms from "#utils/rooms.ts";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("leaveRoom event", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  testPrivateEvent(() => testKit, SocketEvents.LEAVE_ROOM);

  async function setupSockets(
    isToJoinThirdSocketToRoom: boolean = true,
  ): Promise<{
    firstRoom: string;
    secRoom: string | undefined;
    users: { first: User; sec: User };
    clientSockets: {
      first: IOClientSocket;
      sec: IOClientSocket;
      third: IOClientSocket;
    };
    serverSockets: {
      first: IOSocket<true>;
      sec: IOSocket<true>;
      third: IOSocket<true>;
    };
  }> {
    const { user: firstUser, tokens: firstTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { user: secUser, tokens: secTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const firstClientSocket = testKit.createAuthClient(firstTokens.accessToken);
    const secClientSocket = testKit.createAuthClient(firstTokens.accessToken);
    const thirdClientSocket = testKit.createAuthClient(secTokens.accessToken);

    await waitForClientSocketsConnect(
      firstClientSocket,
      secClientSocket,
      thirdClientSocket,
    );

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
      throw new Error("Server sockets aren't defined");
    }

    const firstCreateRoomPromise = waitFor(
      firstClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    const thirdCreateRoomOptionalPromise = isToJoinThirdSocketToRoom
      ? waitFor(thirdClientSocket, SocketResponseEvents.CREATE_ROOM)
      : null;

    firstClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: 10,
      mediaConfig: { audio: false, video: false },
    });

    if (isToJoinThirdSocketToRoom) {
      thirdClientSocket.emit(SocketEvents.CREATE_ROOM, {
        maxMembers: 10,
        mediaConfig: { audio: false, video: false },
      });
    }

    const [firstRoom, secRoom] = (
      await Promise.all([
        firstCreateRoomPromise,
        ...(isToJoinThirdSocketToRoom ? [thirdCreateRoomOptionalPromise] : []),
      ])
    ).map(res => (res as { id: string }).id);

    return {
      firstRoom,
      secRoom,
      users: { first: firstUser, sec: secUser },
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

  it("should properly leave a room and notify about it all target sockets and other room members", async () => {
    const { firstRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
      mediaConfig: { audio: false, video: false },
    });

    await joinRoomPromise;
    const thirdUserLeftPromise = waitFor(
      clientSockets.third,
      SocketEvents.USER_LEFT,
    );

    let firstUserLeftEventPresence = false;
    clientSockets.first.on(SocketEvents.USER_LEFT, () => {
      firstUserLeftEventPresence = true;
    });

    let secUserLeftEventPresence = false;
    clientSockets.sec.on(SocketEvents.USER_LEFT, () => {
      secUserLeftEventPresence = true;
    });

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    const firstLeftRoomPromise = waitFor(
      clientSockets.first,
      SocketEvents.LEFT_ROOM,
    );

    clientSockets.first.emit(SocketEvents.LEAVE_ROOM);
    await waitAfterEmit();

    const thirdUserLeftRes = await thirdUserLeftPromise;
    const firstLeftRoomRes = await firstLeftRoomPromise;

    expect(thirdUserLeftRes).toStrictEqual({ userId: users.first.id });
    expect(firstLeftRoomRes).toStrictEqual({ id: firstRoom });

    expect(firstUserLeftEventPresence).toBe(false);
    expect(secUserLeftEventPresence).toBe(false);
    expect(secLeftRoomEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
  });

  it("should properly leave a room from a non-main socket, notify about it all user sockets and delete room if the last member has left", async () => {
    const { firstRoom, secRoom, clientSockets, serverSockets } =
      await setupSockets();

    let firstUserLeftEventPresence = false;
    clientSockets.first.on(SocketEvents.USER_LEFT, () => {
      firstUserLeftEventPresence = true;
    });

    let secUserLeftEventPresence = false;
    clientSockets.sec.on(SocketEvents.USER_LEFT, () => {
      secUserLeftEventPresence = true;
    });

    let thirdUserLeftEventPresence = false;
    clientSockets.third.on(SocketEvents.USER_LEFT, () => {
      thirdUserLeftEventPresence = true;
    });

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    let thirdLeftRoomEventPresence = false;
    clientSockets.third.on(SocketEvents.LEFT_ROOM, () => {
      thirdLeftRoomEventPresence = true;
    });

    const firstLeftRoomPromise = waitFor(
      clientSockets.first,
      SocketEvents.LEFT_ROOM,
    );

    clientSockets.sec.emit(SocketEvents.LEAVE_ROOM);
    await waitAfterEmit();

    const firstLeftRoomRes = await firstLeftRoomPromise;
    expect(firstLeftRoomRes).toStrictEqual({ id: firstRoom });

    expect(firstUserLeftEventPresence).toBe(false);
    expect(secUserLeftEventPresence).toBe(false);
    expect(thirdUserLeftEventPresence).toBe(false);
    expect(secLeftRoomEventPresence).toBe(false);
    expect(thirdLeftRoomEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(false);
    expect(rooms.has(secRoom as string)).toBe(true);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [secRoom as string])).toBe(
      true,
    );
  });

  it("should do nothing if user is currently not in any room", async () => {
    const { firstRoom, clientSockets, serverSockets } =
      await setupSockets(false);

    let firstUserLeftEventPresence = false;
    clientSockets.first.on(SocketEvents.USER_LEFT, () => {
      firstUserLeftEventPresence = true;
    });

    let secUserLeftEventPresence = false;
    clientSockets.sec.on(SocketEvents.USER_LEFT, () => {
      secUserLeftEventPresence = true;
    });

    let thirdUserLeftEventPresence = false;
    clientSockets.third.on(SocketEvents.USER_LEFT, () => {
      thirdUserLeftEventPresence = true;
    });

    let firstLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      firstLeftRoomEventPresence = true;
    });

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    let thirdLeftRoomEventPresence = false;
    clientSockets.third.on(SocketEvents.LEFT_ROOM, () => {
      thirdLeftRoomEventPresence = true;
    });

    clientSockets.third.emit(SocketEvents.LEAVE_ROOM);
    await waitAfterEmit();

    expect(firstUserLeftEventPresence).toBe(false);
    expect(secUserLeftEventPresence).toBe(false);
    expect(thirdUserLeftEventPresence).toBe(false);
    expect(firstLeftRoomEventPresence).toBe(false);
    expect(secLeftRoomEventPresence).toBe(false);
    expect(thirdLeftRoomEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
  });

  it("should return an error message if an unexpected error is thrown", async () => {
    const { firstRoom, clientSockets, serverSockets } = await setupSockets();

    // fuck all the fancy vitest mock thingies because dealing with ESModules is annoying af
    const originalLeave = serverSockets.first.leave;
    serverSockets.first.leave = () => {
      throw new Error("Unexpected Error");
    };

    try {
      const leaveRoomPromise = waitFor(
        clientSockets.first,
        SocketResponseEvents.LEAVE_ROOM,
      );

      clientSockets.first.emit(SocketEvents.LEAVE_ROOM);
      const res = await leaveRoomPromise;

      expect(res).toStrictEqual({
        error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
      });

      expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    } finally {
      serverSockets.first.leave = originalLeave;
    }
  });
});
