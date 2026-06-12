import type { User } from "#generated/prisma/client.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { IOClientSocket, IOSocket } from "#types/socket.ts";
import leaveRoom, { defaultLeaveRoomOptions } from "#utils/leaveRoom.ts";
import rooms from "#utils/rooms.ts";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("leaveRoom", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  async function setupOneUserTest(): Promise<{
    room: string;
    user: User;
    clientSocket: IOClientSocket;
    serverSocket: IOSocket<true>;
  }> {
    const { user, tokens } = await createAuthUser(getUniqueMockUserWithoutId());
    const clientSocket = testKit.createAuthClient(tokens.accessToken);

    await waitForClientSocketsConnect(clientSocket);

    const firstClientSocketCreateRoomPromise = waitFor(
      clientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSocket.emit(SocketEvents.CREATE_ROOM, { maxMembers: 10 });
    const room = ((await firstClientSocketCreateRoomPromise) as { id: string })
      .id;

    const serverSocket = getServerSocket<true>(testKit.io, clientSocket.id);
    if (!serverSocket) throw new Error("Server socket isn't defined");

    return { room, user, clientSocket, serverSocket };
  }

  async function setupTwoUsersTest(): Promise<{
    room: string;
    users: { first: User; sec: User };
    clientSockets: { first: IOClientSocket; sec: IOClientSocket };
    serverSockets: { first: IOSocket<true>; sec: IOSocket<true> };
  }> {
    const { user: firstUser, tokens: firstUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { user: secUser, tokens: secUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const firstClientSocket = testKit.createAuthClient(
      firstUserTokens.accessToken,
    );

    const secClientSocket = testKit.createAuthClient(secUserTokens.accessToken);
    await waitForClientSocketsConnect(firstClientSocket, secClientSocket);

    const firstClientSocketCreateRoomPromise = waitFor(
      firstClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    firstClientSocket.emit(SocketEvents.CREATE_ROOM, { maxMembers: 10 });
    const room = ((await firstClientSocketCreateRoomPromise) as { id: string })
      .id;

    const secClientSocketCreateRoomPromise = waitFor(
      secClientSocket,
      SocketResponseEvents.JOIN_ROOM,
    );

    secClientSocket.emit(SocketEvents.JOIN_ROOM, { id: room });
    await secClientSocketCreateRoomPromise;

    const firstServerSocket = getServerSocket<true>(
      testKit.io,
      firstClientSocket.id,
    );

    const secServerSocket = getServerSocket<true>(
      testKit.io,
      secClientSocket.id,
    );

    if (!firstServerSocket || !secServerSocket) {
      throw new Error("Server sockets aren't defined");
    }

    return {
      room,
      users: { first: firstUser, sec: secUser },
      clientSockets: { first: firstClientSocket, sec: secClientSocket },
      serverSockets: { first: firstServerSocket, sec: secServerSocket },
    };
  }

  it("should be called with '{ isToNotifyRoom: true, isToDeleteRoomOnEmpty: true }' by default", () => {
    expect(defaultLeaveRoomOptions).toStrictEqual({
      isToNotifyRoom: true,
      isToDeleteRoomOnEmpty: true,
    });
  });

  it("should leave room with USER_LEFT notification for the remaining room member and LEFT_ROOM for the leaver", async () => {
    const { room, users, clientSockets, serverSockets } =
      await setupTwoUsersTest();

    const leftRoomPromise = waitFor(
      clientSockets.first,
      SocketEvents.LEFT_ROOM,
    );

    const userLeftPromise = waitFor(clientSockets.sec, SocketEvents.USER_LEFT);
    const leftRoom = await leaveRoom(testKit.io, serverSockets.first, {
      isToNotifyRoom: true,
      isToNotifyTargetSocket: true,
    });

    expect(leftRoom).toBeDefined();
    expect(leftRoom?.id).toBe(room);

    expect(await leftRoomPromise).toStrictEqual({ id: room });
    expect(await userLeftPromise).toStrictEqual({ userId: users.first.id });
  });

  it("should leave room silently", async () => {
    const { room, clientSockets, serverSockets } = await setupTwoUsersTest();

    let firstClientSocketLeftRoomEventPresence = false;
    clientSockets.first.on(SocketEvents.LEFT_ROOM, () => {
      firstClientSocketLeftRoomEventPresence = true;
    });

    let secClientSocketUserLeftEventPresence = false;
    clientSockets.sec.on(SocketEvents.USER_LEFT, () => {
      secClientSocketUserLeftEventPresence = true;
    });

    const leftRoom = await leaveRoom(testKit.io, serverSockets.first, {
      isToNotifyRoom: false,
      isToNotifyTargetSocket: false,
    });

    expect(leftRoom).toBeDefined();
    expect(leftRoom?.id).toBe(room);

    expect(firstClientSocketLeftRoomEventPresence).toBe(false);
    expect(secClientSocketUserLeftEventPresence).toBe(false);
  });

  it("should delete room if the last member leaves", async () => {
    const { room, serverSocket } = await setupOneUserTest();
    const leftRoom = await leaveRoom(testKit.io, serverSocket, {
      isToDeleteRoomOnEmpty: true,
    });

    expect(leftRoom).toBeDefined();
    expect(leftRoom?.id).toBe(room);

    expect(rooms.has(room)).toBe(false);
  });

  it("should do nothing if the room requested to be left from doesn't exist", async () => {
    const { room, serverSocket } = await setupOneUserTest();
    const leftRoom = await leaveRoom(testKit.io, serverSocket, {
      roomIdToLeave: `${room}-unknown`,
    });

    expect(leftRoom).toBeUndefined();
  });
});
