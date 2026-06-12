import mapToUserDto from "#dtos/userDto.ts";
import type { User } from "#generated/prisma/client.ts";
import * as getRoomUsersModule from "#services/getRoomUsers.ts";
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
import generateRoomId from "#utils/generateRoomId.ts";
import rooms from "#utils/rooms.ts";
import * as sharedModule from "@speak-up/shared";
import { SocketEvents, SocketResponseEvents, UserDto } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("joinRoom event", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await testKit.cleanup();
  });

  testPrivateEvent(
    () => testKit,
    SocketEvents.JOIN_ROOM,
    SocketResponseEvents.JOIN_ROOM,
    { id: generateRoomId() },
  );

  async function setupSockets(areRoomsForSingleUser: boolean = false): Promise<{
    firstRoom: string;
    secRoom: string;
    users: { first: User; sec: User };
    userDtos: { first: UserDto; sec: UserDto };
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

    const thirdCreateRoomPromise = waitFor(
      thirdClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    firstClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: areRoomsForSingleUser ? 1 : 10,
    });

    thirdClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: areRoomsForSingleUser ? 1 : 10,
    });

    const [firstRoom, secRoom] = (
      await Promise.all([firstCreateRoomPromise, thirdCreateRoomPromise])
    ).map(res => (res as { id: string }).id);

    const sendMessagePromise = waitFor(
      firstClientSocket,
      SocketResponseEvents.SEND_MESSAGE,
    );

    firstClientSocket.emit(SocketEvents.SEND_MESSAGE, {
      content: [{ type: "text", value: "value" }],
    });

    await sendMessagePromise;

    const userDtos = {
      first: mapToUserDto(firstUser),
      sec: mapToUserDto(secUser),
    } as const;

    return {
      firstRoom,
      secRoom,
      users: { first: firstUser, sec: secUser },
      userDtos,
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

  it("should properly join a room and leave the previous one", async () => {
    const { firstRoom, secRoom, userDtos, clientSockets, serverSockets } =
      await setupSockets();

    const { tokens: thirdTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const fourthClientSocket = testKit.createAuthClient(
      thirdTokens.accessToken,
    );

    await waitForClientSocketsConnect(fourthClientSocket);
    const fourthServerSocket = getServerSocket(
      testKit.io,
      fourthClientSocket.id,
    );

    if (!fourthServerSocket) throw new Error("Server socket isn't defined");

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    const firstUserJoinedPromise = waitFor(
      clientSockets.first,
      SocketEvents.USER_JOINED,
    );

    const thirdLeftRoomPromise = waitFor(
      clientSockets.third,
      SocketEvents.LEFT_ROOM,
    );

    let thirdUserJoinedEventPresence = false;
    clientSockets.third.on(SocketEvents.USER_JOINED, () => {
      thirdUserJoinedEventPresence = true;
    });

    let thirdUserLeftEventPresence = false;
    clientSockets.third.on(SocketEvents.USER_LEFT, () => {
      thirdUserLeftEventPresence = true;
    });

    let fourthUserJoinedEventPresence = false;
    fourthClientSocket.on(SocketEvents.USER_JOINED, () => {
      fourthUserJoinedEventPresence = true;
    });

    let fourthUserLeftEventPresence = false;
    fourthClientSocket.on(SocketEvents.USER_LEFT, () => {
      fourthUserLeftEventPresence = true;
    });

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    const joinRoomRes = await joinRoomPromise;
    const userJoinedRes = await firstUserJoinedPromise;
    const leftRoomRes = await thirdLeftRoomPromise;

    expect(joinRoomRes).toStrictEqual({
      users: [userDtos.first, userDtos.sec],
      messages: rooms.get(firstRoom)?.messages,
    });

    expect(userJoinedRes).toStrictEqual({ user: userDtos.sec });
    expect(leftRoomRes).toStrictEqual({ id: secRoom });

    expect(thirdUserJoinedEventPresence).toBe(false);
    expect(thirdUserLeftEventPresence).toBe(false);
    expect(fourthUserJoinedEventPresence).toBe(false);
    expect(fourthUserLeftEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);
    expect(rooms.has(secRoom)).toBe(false);

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.third, [secRoom])).toBe(false);
  });

  it("should silently join room from another socket", async () => {
    const { firstRoom, userDtos, clientSockets, serverSockets } =
      await setupSockets();

    const thirdJoinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    const firstUserJoinedPromise = waitFor(
      clientSockets.first,
      SocketEvents.USER_JOINED,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    await thirdJoinRoomPromise;
    await firstUserJoinedPromise;

    const secJoinRoomPromise = waitFor(
      clientSockets.sec,
      SocketResponseEvents.JOIN_ROOM,
    );

    const firstLeftRoomPromise = waitFor(
      clientSockets.first,
      SocketEvents.LEFT_ROOM,
    );

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    let firstUserJoinedEventPresence = false;
    clientSockets.first.on(SocketEvents.USER_JOINED, () => {
      firstUserJoinedEventPresence = true;
    });

    let thirdUserJoinedEventPresence = false;
    clientSockets.third.on(SocketEvents.USER_JOINED, () => {
      thirdUserJoinedEventPresence = true;
    });

    clientSockets.sec.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    const joinRoomRes = await secJoinRoomPromise;
    const leftRoomRes = await firstLeftRoomPromise;

    await waitAfterEmit();

    expect(joinRoomRes).toStrictEqual({
      users: [userDtos.first, userDtos.sec],
      messages: rooms.get(firstRoom)?.messages,
    });

    expect(leftRoomRes).toStrictEqual({ id: firstRoom });

    expect(secLeftRoomEventPresence).toBe(false);
    expect(firstUserJoinedEventPresence).toBe(false);
    expect(thirdUserJoinedEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(true);
  });

  it("should properly join a room from another socket without room deletion", async () => {
    const { firstRoom, userDtos, clientSockets, serverSockets } =
      await setupSockets();

    const secJoinRoomPromise = waitFor(
      clientSockets.sec,
      SocketResponseEvents.JOIN_ROOM,
    );

    const firstLeftRoomPromise = waitFor(
      clientSockets.first,
      SocketEvents.LEFT_ROOM,
    );
    clientSockets.sec.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    const joinRoomRes = await secJoinRoomPromise;
    const leftRoomRes = await firstLeftRoomPromise;

    expect(joinRoomRes).toStrictEqual({
      users: [userDtos.first],
      messages: rooms.get(firstRoom)?.messages,
    });

    expect(leftRoomRes).toStrictEqual({ id: firstRoom });
    expect(rooms.has(firstRoom)).toBe(true);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(true);
  });

  it("should do nothing when trying to join a room that is already joined by this socket", async () => {
    const { firstRoom, clientSockets, serverSockets } = await setupSockets();
    const thirdJoinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    const firstUserJoinedPromise = waitFor(
      clientSockets.first,
      SocketEvents.USER_JOINED,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    await thirdJoinRoomPromise;
    await firstUserJoinedPromise;

    let firstJoinRoomEventPresence = false;
    clientSockets.first.on(SocketResponseEvents.JOIN_ROOM, () => {
      firstJoinRoomEventPresence = true;
    });

    let firstLeftRoomEventPresence = false;
    clientSockets.first.on(SocketEvents.LEFT_ROOM, () => {
      firstLeftRoomEventPresence = true;
    });

    let firstUserJoinedEventPresence = false;
    clientSockets.first.on(SocketEvents.USER_JOINED, () => {
      firstUserJoinedEventPresence = true;
    });

    let secLeftRoomEventPresence = false;
    clientSockets.sec.on(SocketEvents.LEFT_ROOM, () => {
      secLeftRoomEventPresence = true;
    });

    let secUserJoinedEventPresence = false;
    clientSockets.sec.on(SocketEvents.USER_JOINED, () => {
      secUserJoinedEventPresence = true;
    });

    let thirdLeftRoomEventPresence = false;
    clientSockets.third.on(SocketEvents.LEFT_ROOM, () => {
      thirdLeftRoomEventPresence = true;
    });

    let thirdUserJoinedEventPresence = false;
    clientSockets.third.on(SocketEvents.USER_JOINED, () => {
      thirdUserJoinedEventPresence = true;
    });

    clientSockets.first.emit(SocketEvents.JOIN_ROOM, { id: firstRoom });
    await waitAfterEmit();

    expect(firstJoinRoomEventPresence).toBe(false);
    expect(firstLeftRoomEventPresence).toBe(false);
    expect(firstUserJoinedEventPresence).toBe(false);

    expect(secLeftRoomEventPresence).toBe(false);
    expect(secUserJoinedEventPresence).toBe(false);

    expect(thirdLeftRoomEventPresence).toBe(false);
    expect(thirdUserJoinedEventPresence).toBe(false);

    expect(rooms.has(firstRoom)).toBe(true);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
  });

  it("should return an error message if user was removed before", async () => {
    const { firstRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const room = rooms.get(firstRoom);
    if (room) {
      room.removedUserIds = new Set([users.sec.id]);
    }

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    const res = await joinRoomPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.CANT_JOIN_ROOM,
    });

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
  });

  it("should return an error message if a room to join is already full", async () => {
    const { firstRoom, clientSockets, serverSockets } =
      await setupSockets(true);

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    const res = await joinRoomPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.FULL_ROOM,
    });

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
  });

  it("should return an error message if invalid data is provided", async () => {
    const { firstRoom, secRoom, clientSockets, serverSockets } =
      await setupSockets();

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: 0e1 as unknown as string,
    });

    const res = await joinRoomPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.INVALID_DATA,
    });

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [secRoom])).toBe(true);
  });

  it("should return an error message when trying to join an unexisting room", async () => {
    const { firstRoom, secRoom, clientSockets, serverSockets } =
      await setupSockets();

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, {
      id: `${firstRoom}corrupted`,
    });

    const res = await joinRoomPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.ROOM_DOESNT_EXIST,
    });

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [secRoom])).toBe(true);
  });

  it("should return an error message and properly clean up everything if an unexpected error is thrown inside getRoomUsers", async () => {
    vi.spyOn(getRoomUsersModule, "default").mockRejectedValue(
      new Error("Unexpected Error"),
    );

    const { firstRoom, secRoom, clientSockets, serverSockets } =
      await setupSockets();

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, { id: firstRoom });
    const res = await joinRoomPromise;

    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [secRoom])).toBe(false);
  });

  it("should return an error message if an unexpected error is thrown", async () => {
    vi.spyOn(sharedModule, "getZodJoinRoomDataValidation").mockRejectedValue(
      new Error("Unexpected Error"),
    );

    const { firstRoom, secRoom, clientSockets, serverSockets } =
      await setupSockets();

    const joinRoomPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.JOIN_ROOM,
    );

    clientSockets.third.emit(SocketEvents.JOIN_ROOM, { id: firstRoom });
    const res = await joinRoomPromise;

    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });

    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [secRoom])).toBe(true);
  });
});
