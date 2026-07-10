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
import type { IOClientSocket, IOSocket } from "#types/socket.ts";
import { SocketResponseErrorMessages } from "#types/socketResponseErrorMessages.ts";
import rooms from "#utils/rooms.ts";
import * as sharedModule from "@speak-up/shared";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("removeUser event", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await testKit.cleanup();
  });

  testPrivateEvent(() => testKit, SocketEvents.REMOVE_USER);

  async function setupSockets(
    isToJoinThirdSocketToRoom: boolean = true,
  ): Promise<{
    firstRoom: string;
    secRoom: string;
    users: { first: User; sec: User; third: User };
    clientSockets: {
      first: IOClientSocket;
      sec: IOClientSocket;
      third: IOClientSocket;
      fourth: IOClientSocket;
    };
    serverSockets: {
      first: IOSocket<true>;
      sec: IOSocket<true>;
      third: IOSocket<true>;
      fourth: IOSocket<true>;
    };
  }> {
    const { user: firstUser, tokens: firstTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { user: secUser, tokens: secTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { user: thirdUser, tokens: thirdTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const firstClientSocket = testKit.createAuthClient(firstTokens.accessToken);
    const secClientSocket = testKit.createAuthClient(firstTokens.accessToken);
    const thirdClientSocket = testKit.createAuthClient(secTokens.accessToken);
    const fourthClientSocket = testKit.createAuthClient(
      thirdTokens.accessToken,
    );

    await waitForClientSocketsConnect(
      firstClientSocket,
      secClientSocket,
      thirdClientSocket,
      fourthClientSocket,
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

    const fourthServerSocket = getServerSocket<true>(
      testKit.io,
      fourthClientSocket.id,
    );

    if (
      !firstServerSocket ||
      !secServerSocket ||
      !thirdServerSocket ||
      !fourthServerSocket
    ) {
      throw new Error("Server sockets aren't defined");
    }

    const firstCreateRoomPromise = waitFor(
      firstClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    const fourthCreateRoomPromise = waitFor(
      fourthClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    firstClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: 10,
    });

    fourthClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: 10,
    });

    const firstCreateRoomRes = await firstCreateRoomPromise;
    const fourthCreateRoomRes = await fourthCreateRoomPromise;

    const firstRoom = (firstCreateRoomRes as { id: string }).id;
    const secRoom = (fourthCreateRoomRes as { id: string }).id;

    if (isToJoinThirdSocketToRoom) {
      const thirdJoinRoomPromise = waitFor(
        thirdClientSocket,
        SocketResponseEvents.JOIN_ROOM,
      );

      thirdClientSocket.emit(SocketEvents.JOIN_ROOM, {
        id: firstRoom,
      });

      await thirdJoinRoomPromise;
    }

    return {
      firstRoom,
      secRoom,
      users: { first: firstUser, sec: secUser, third: thirdUser },
      clientSockets: {
        first: firstClientSocket,
        sec: secClientSocket,
        third: thirdClientSocket,
        fourth: fourthClientSocket,
      },
      serverSockets: {
        first: firstServerSocket,
        sec: secServerSocket,
        third: thirdServerSocket,
        fourth: fourthServerSocket,
      },
    };
  }

  async function testSuccessfulRemoveUser(
    isMainSocket: boolean,
  ): Promise<void> {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const firstUserLeftPromise = waitFor(
      clientSockets.first,
      SocketEvents.USER_LEFT,
    );

    const thirdLeftRoomPromise = waitFor(
      clientSockets.third,
      SocketEvents.LEFT_ROOM,
    );

    let secUserLeftEventPresence = false;
    clientSockets.sec.on(SocketEvents.USER_LEFT, () => {
      secUserLeftEventPresence = true;
    });

    let fourthUserLeftEventPresence = false;
    clientSockets.fourth.on(SocketEvents.USER_LEFT, () => {
      fourthUserLeftEventPresence = true;
    });

    let firstLeftRoomEventPresence = false;
    clientSockets.first.on(SocketEvents.LEFT_ROOM, () => {
      firstLeftRoomEventPresence = true;
    });

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    let fourthLeftRoomEventPresence = false;
    clientSockets.fourth.on(SocketEvents.LEFT_ROOM, () => {
      fourthLeftRoomEventPresence = true;
    });

    (isMainSocket ? clientSockets.first : clientSockets.sec).emit(
      SocketEvents.REMOVE_USER,
      {
        userId: users.sec.id,
      },
    );

    await waitAfterEmit();

    const thirdLeftRoomRes = await thirdLeftRoomPromise;
    const firstUserLeftRoomRes = await firstUserLeftPromise;

    expect(thirdLeftRoomRes).toStrictEqual({ id: firstRoom });
    expect(firstUserLeftRoomRes).toStrictEqual({ userId: users.sec.id });

    expect(secUserLeftEventPresence).toBe(false);
    expect(fourthUserLeftEventPresence).toBe(false);

    expect(firstLeftRoomEventPresence).toBe(false);
    expect(secLeftRoomEventPresence).toBe(false);
    expect(fourthLeftRoomEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);
    expect(rooms.has(secRoom)).toBe(true);

    expect(rooms.get(firstRoom)?.removedUserIds).toEqual(
      new Set([users.sec.id]),
    );

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  }

  it("should properly remove a user from a room (main socket)", async () =>
    await testSuccessfulRemoveUser(true));

  it("should properly remove a user from a room (non-main socket)", async () =>
    await testSuccessfulRemoveUser(false));

  it("should silently disallow joining of an unexisting room member when trying to remove one", async () => {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const corruptedUserIdToRemove = `${users.third.id}corrupted`;

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

    let fourthUserLeftEventPresence = false;
    clientSockets.fourth.on(SocketEvents.USER_LEFT, () => {
      fourthUserLeftEventPresence = true;
    });

    let firstLeftRoomEventPresence = false;
    clientSockets.first.on(SocketEvents.LEFT_ROOM, () => {
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

    let fourthLeftRoomEventPresence = false;
    clientSockets.fourth.on(SocketEvents.LEFT_ROOM, () => {
      fourthLeftRoomEventPresence = true;
    });

    clientSockets.first.emit(SocketEvents.REMOVE_USER, {
      userId: corruptedUserIdToRemove,
    });

    await waitAfterEmit();

    expect(firstUserLeftEventPresence).toBe(false);
    expect(secUserLeftEventPresence).toBe(false);
    expect(thirdUserLeftEventPresence).toBe(false);
    expect(fourthUserLeftEventPresence).toBe(false);

    expect(firstLeftRoomEventPresence).toBe(false);
    expect(thirdLeftRoomEventPresence).toBe(false);
    expect(secLeftRoomEventPresence).toBe(false);
    expect(fourthLeftRoomEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);
    expect(rooms.has(secRoom)).toBe(true);

    expect(rooms.get(firstRoom)?.removedUserIds).toEqual(
      new Set([corruptedUserIdToRemove]),
    );

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  });

  it("should return an error message when trying to remove self as a host", async () => {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const removeUserPromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.REMOVE_USER,
    );

    clientSockets.first.emit(SocketEvents.REMOVE_USER, {
      userId: users.first.id,
    });

    const res = await removeUserPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.CANT_REMOVE_YOURSELF,
    });

    expect(rooms.get(firstRoom)?.removedUserIds).toHaveLength(0);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  });

  it("should return an error message when trying to remove a user while not being a host", async () => {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const removeUserPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.REMOVE_USER,
    );

    clientSockets.third.emit(SocketEvents.REMOVE_USER, {
      userId: users.first.id,
    });

    const res = await removeUserPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.NOT_HOST,
    });

    expect(rooms.get(firstRoom)?.removedUserIds).toHaveLength(0);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  });

  it("should return an error message if invalid data is provided", async () => {
    const { firstRoom, secRoom, clientSockets, serverSockets } =
      await setupSockets();

    const removeUserPromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.REMOVE_USER,
    );

    clientSockets.first.emit(SocketEvents.REMOVE_USER, {
      userId: 0e1 as unknown as string,
    });

    const res = await removeUserPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.INVALID_DATA,
    });

    expect(rooms.get(firstRoom)?.removedUserIds).toHaveLength(0);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  });

  it("should return an error message when trying to remove a user while being missing in any room", async () => {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets(false);

    const removeUserPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.REMOVE_USER,
    );

    clientSockets.third.emit(SocketEvents.REMOVE_USER, {
      userId: users.first.id,
    });

    const res = await removeUserPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM,
    });

    expect(rooms.get(firstRoom)?.removedUserIds).toHaveLength(0);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  });

  it("should return an error message if an unexpected error is thrown", async () => {
    vi.spyOn(sharedModule, "getZodRemoveUserDataValidation").mockRejectedValue(
      new Error("Unexpected Error"),
    );

    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const removeUserPromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.REMOVE_USER,
    );

    clientSockets.first.emit(SocketEvents.REMOVE_USER, {
      userId: users.sec.id,
    });

    const res = await removeUserPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });

    expect(rooms.get(firstRoom)?.removedUserIds).toHaveLength(0);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  });
});
