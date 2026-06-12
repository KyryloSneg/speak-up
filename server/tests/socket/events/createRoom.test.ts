import type { User } from "#generated/prisma/client.ts";
import checkIsSocketInRoom from "#tests/socket/utils/checkIsSocketInRoom.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import testPrivateEvent from "#tests/socket/utils/testPrivateEvent.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import waitAfterEmit from "#tests/socket/utilsTests/waitAfterEmit.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { Room } from "#types/room.ts";
import type { IOClientSocket, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import rooms from "#utils/rooms.ts";
import * as sharedModule from "@speak-up/shared";
import {
  SocketEvents,
  SocketResponseEvents,
  type SocketClientToServerEventsData,
} from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("createRoom event", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await testKit.cleanup();
  });

  const validData: SocketClientToServerEventsData[typeof SocketEvents.CREATE_ROOM] =
    { maxMembers: 10 };

  const invalidData: SocketClientToServerEventsData[typeof SocketEvents.CREATE_ROOM] =
    { maxMembers: 0 };

  testPrivateEvent(
    () => testKit,
    SocketEvents.CREATE_ROOM,
    SocketResponseEvents.CREATE_ROOM,
    validData,
  );

  async function setupSocket(): Promise<{
    user: User;
    clientSocket: IOClientSocket;
    serverSocket: IOSocket<true>;
  }> {
    const { user, tokens } = await createAuthUser(getUniqueMockUserWithoutId());
    const clientSocket = testKit.createAuthClient(tokens.accessToken);

    await waitForClientSocketsConnect(clientSocket);

    const serverSocket = getServerSocket<true>(testKit.io, clientSocket.id);
    if (!serverSocket) throw new Error("Server socket isn't defined");

    return { user, clientSocket, serverSocket };
  }

  async function setupTwoSockets(): Promise<{
    user: User;
    clientSockets: { first: IOClientSocket; sec: IOClientSocket };
    serverSockets: { first: IOSocket<true>; sec: IOSocket<true> };
  }> {
    const { user, tokens } = await createAuthUser(getUniqueMockUserWithoutId());
    const firstClientSocket = testKit.createAuthClient(tokens.accessToken);
    const secClientSocket = testKit.createAuthClient(tokens.accessToken);

    await waitForClientSocketsConnect(firstClientSocket, secClientSocket);

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
      user,
      clientSockets: { first: firstClientSocket, sec: secClientSocket },
      serverSockets: { first: firstServerSocket, sec: secServerSocket },
    };
  }

  it("should successfully create a room", async () => {
    const { user, clientSocket, serverSocket } = await setupSocket();
    const createRoomPromise = waitFor(
      clientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSocket.emit(SocketEvents.CREATE_ROOM, validData);
    const roomId = ((await createRoomPromise) as { id: string }).id;

    expect(rooms.get(roomId)).toStrictEqual({
      id: roomId,
      hostId: user.id,
      removedUserIds: new Set(),
      messages: [],
      maxMembers: validData.maxMembers,
    } as Room);

    expect([...serverSocket.rooms].some(room => room === roomId)).toBe(true);
  });

  it("should successfully create a room twice in a row", async () => {
    const { user, clientSocket, serverSocket } = await setupSocket();
    const firstCreateRoomPromise = waitFor(
      clientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSocket.emit(SocketEvents.CREATE_ROOM, validData);
    const firstRoomId = ((await firstCreateRoomPromise) as { id: string }).id;

    const secCreateRoomPromise = waitFor(
      clientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSocket.emit(SocketEvents.CREATE_ROOM, validData);
    const secRoomId = ((await secCreateRoomPromise) as { id: string }).id;

    expect(rooms.has(firstRoomId)).toBe(false);
    expect(rooms.get(secRoomId)).toStrictEqual({
      id: secRoomId,
      hostId: user.id,
      removedUserIds: new Set(),
      messages: [],
      maxMembers: validData.maxMembers,
    } as Room);

    expect(checkIsSocketInRoom(serverSocket, [secRoomId])).toBe(true);
    expect(checkIsSocketInRoom(serverSocket, [firstRoomId])).toBe(false);
  });

  it("should successfully create a room from the second socket if the first one was already in the other room (the only member of it)", async () => {
    const { clientSockets, serverSockets } = await setupTwoSockets();

    const { tokens: secTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const thirdClientSocket = testKit.createAuthClient(secTokens.accessToken);

    await waitForClientSocketsConnect(thirdClientSocket);
    const thirdServerSocket = getServerSocket(testKit.io, thirdClientSocket.id);

    if (!thirdServerSocket) throw new Error("Server socket isn't defined");

    const firstCreateRoomPromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSockets.first.emit(SocketEvents.CREATE_ROOM, validData);
    const firstRoomId = ((await firstCreateRoomPromise) as { id: string }).id;

    const secCreateRoomPromise = waitFor(
      clientSockets.sec,
      SocketResponseEvents.CREATE_ROOM,
    );

    const firstLeftRoomPromise = waitFor(
      clientSockets.first,
      SocketEvents.LEFT_ROOM,
    );

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    let thirdUserLeftEventPresence = false;
    thirdClientSocket.on(SocketEvents.USER_LEFT, () => {
      thirdUserLeftEventPresence = true;
    });

    clientSockets.sec.emit(SocketEvents.CREATE_ROOM, validData);

    const secRoomId = ((await secCreateRoomPromise) as { id: string }).id;
    const leftRoomData = await firstLeftRoomPromise;

    await waitAfterEmit();

    expect(rooms.has(firstRoomId)).toBe(false);
    expect(rooms.has(secRoomId)).toBe(true);

    expect(leftRoomData).toStrictEqual({ id: firstRoomId });
    expect(secLeftRoomEventPresence).toBe(false);
    expect(thirdUserLeftEventPresence).toBe(false);

    expect(
      checkIsSocketInRoom(serverSockets.first, [firstRoomId, secRoomId]),
    ).toBe(false);

    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoomId])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.sec, [secRoomId])).toBe(true);
  });

  it("should return an error message if invalid data is provided", async () => {
    const { clientSocket } = await setupSocket();
    const createRoomPromise = waitFor(
      clientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSocket.emit(SocketEvents.CREATE_ROOM, invalidData);
    const res = await createRoomPromise;

    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.INVALID_DATA,
    });
  });

  it("should return an error message if an unexpected error is thrown", async () => {
    vi.spyOn(sharedModule, "getZodCreateRoomDataValidation").mockRejectedValue(
      new Error("Unexpected Error"),
    );

    const { clientSocket } = await setupSocket();
    const createRoomPromise = waitFor(
      clientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    clientSocket.emit(SocketEvents.CREATE_ROOM, validData);
    const res = await createRoomPromise;

    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });
  });
});
