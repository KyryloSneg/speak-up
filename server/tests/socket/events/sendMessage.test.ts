import type { User } from "#generated/prisma/client.ts";
import prisma from "#services/prisma.ts";
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
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
  type SocketClientToServerEventsData,
} from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("sendMessage event", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await testKit.cleanup();
  });

  type SendMessageData =
    SocketClientToServerEventsData[typeof SocketEvents.SEND_MESSAGE];

  const validDataObj: SendMessageData = {
    content: [{ type: "text", value: "value" }],
  };

  const invalidDataObj: SendMessageData = {
    content: [{ type: "text", value: "" }],
  };

  testPrivateEvent(() => testKit, SocketEvents.SEND_MESSAGE);

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

  async function testSuccessfulSendMessage(
    isMainSocket: boolean,
  ): Promise<void> {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const targetClientSocket = isMainSocket
      ? clientSockets.first
      : clientSockets.sec;

    const sendMessagePromise = waitFor(
      targetClientSocket,
      SocketResponseEvents.SEND_MESSAGE,
    );

    const receivedMessagePromise = waitFor(
      clientSockets.third,
      SocketEvents.RECEIVED_MESSAGE,
    );

    let firstReceivedMessagePresence = false;
    clientSockets.first.on(SocketEvents.RECEIVED_MESSAGE, () => {
      firstReceivedMessagePresence = true;
    });

    let secReceivedMessagePresence = false;
    clientSockets.sec.on(SocketEvents.RECEIVED_MESSAGE, () => {
      secReceivedMessagePresence = true;
    });

    let fourthReceivedMessagePresence = false;
    clientSockets.fourth.on(SocketEvents.RECEIVED_MESSAGE, () => {
      fourthReceivedMessagePresence = true;
    });

    targetClientSocket.emit(SocketEvents.SEND_MESSAGE, validDataObj);

    await waitAfterEmit();
    const sendMessageRes =
      ((await sendMessagePromise) as { message: Message }) || undefined;

    const receivedMessageRes = await receivedMessagePromise;

    expect(Object.keys(sendMessageRes?.message || {}).length).toBe(5);

    expect(sendMessageRes?.message.id).toBeTypeOf("string");
    expect(sendMessageRes?.message.userId).toBe(users.first.id);
    expect(sendMessageRes?.message.content).toStrictEqual(validDataObj.content);
    expect(sendMessageRes?.message.createdAt).toBeTypeOf("string");

    expect(Object.keys(sendMessageRes?.message.user || {}).length).toBe(2);

    expect(sendMessageRes?.message.user.nickname).toBe(users.first.nickname);
    expect(sendMessageRes?.message.user.picture).toBe(users.first.picture);

    expect(receivedMessageRes).toStrictEqual({
      message: sendMessageRes?.message,
    });

    expect(firstReceivedMessagePresence).toBe(!isMainSocket);
    expect(secReceivedMessagePresence).toBe(false);
    expect(fourthReceivedMessagePresence).toBe(false);

    expect(rooms.get(firstRoom)?.messages).toStrictEqual([
      sendMessageRes?.message,
    ]);
    expect(rooms.get(secRoom)?.messages).toHaveLength(0);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  }

  it("should properly send a message (main socket)", async () =>
    await testSuccessfulSendMessage(true));

  it("should properly send a message (non-main socket)", async () =>
    await testSuccessfulSendMessage(false));

  it("should return an error message when trying to send a message while being missing in any room", async () => {
    const { firstRoom, secRoom, clientSockets } = await setupSockets(false);
    const sendMessagePromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.SEND_MESSAGE,
    );

    clientSockets.third.emit(SocketEvents.SEND_MESSAGE, validDataObj);

    const res = await sendMessagePromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM,
    });

    expect(rooms.get(firstRoom)?.messages).toHaveLength(0);
    expect(rooms.get(secRoom)?.messages).toHaveLength(0);
  });

  it("should return an error message if invalid data is provided", async () => {
    const { firstRoom, secRoom, clientSockets } = await setupSockets();
    const sendMessagePromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.SEND_MESSAGE,
    );

    clientSockets.first.emit(SocketEvents.SEND_MESSAGE, invalidDataObj);

    const res = await sendMessagePromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.INVALID_DATA,
    });

    expect(rooms.get(firstRoom)?.messages).toHaveLength(0);
    expect(rooms.get(secRoom)?.messages).toHaveLength(0);
  });

  it("should return an error message if user doesn't exist in the DB", async () => {
    vi.spyOn(prisma.user, "findMany").mockResolvedValue([]);

    const { firstRoom, secRoom, clientSockets } = await setupSockets();
    const sendMessagePromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.SEND_MESSAGE,
    );

    clientSockets.first.emit(SocketEvents.SEND_MESSAGE, validDataObj);

    const res = await sendMessagePromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });

    expect(rooms.get(firstRoom)?.messages).toHaveLength(0);
    expect(rooms.get(secRoom)?.messages).toHaveLength(0);
  });

  it("should return an error message if an unexpected error is thrown", async () => {
    vi.spyOn(sharedModule, "getZodSendMessageDataValidation").mockRejectedValue(
      new Error("Unexpected Error"),
    );

    const { firstRoom, secRoom, clientSockets } = await setupSockets();
    const sendMessagePromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.SEND_MESSAGE,
    );

    clientSockets.first.emit(SocketEvents.SEND_MESSAGE, validDataObj);

    const res = await sendMessagePromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });

    expect(rooms.get(firstRoom)?.messages).toHaveLength(0);
    expect(rooms.get(secRoom)?.messages).toHaveLength(0);
  });
});
