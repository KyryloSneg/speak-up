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
import * as sharedModule from "@speak-up/shared";
import {
  SocketEvents,
  SocketResponseEvents,
  type SocketClientToServerEventsData,
} from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("sendMediaConfig event", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await testKit.cleanup();
  });

  type SendMediaConfigData =
    SocketClientToServerEventsData[typeof SocketEvents.SEND_MEDIA_CONFIG];

  const validDataObj: SendMediaConfigData = {
    config: { audio: true, video: true },
  };

  const invalidDataObj: SendMediaConfigData = {
    config: { audio: "true" as unknown as boolean, video: true },
  };

  testPrivateEvent(() => testKit, SocketEvents.SEND_MEDIA_CONFIG);

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
      mediaConfig: { audio: true, video: true },
    });

    fourthClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: 10,
      mediaConfig: { audio: true, video: true },
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
        mediaConfig: { audio: true, video: true },
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

  async function testSuccessfulSendMediaConfig(
    isMainSocket: boolean,
  ): Promise<void> {
    const { firstRoom, secRoom, users, clientSockets, serverSockets } =
      await setupSockets();

    const targetClientSocket = isMainSocket
      ? clientSockets.first
      : clientSockets.sec;

    const receivedMediaConfigPromise = waitFor(
      clientSockets.third,
      SocketEvents.RECEIVED_MEDIA_CONFIG,
    );

    let firstReceivedMediaConfigPresence = false;
    clientSockets.first.on(SocketEvents.RECEIVED_MEDIA_CONFIG, () => {
      firstReceivedMediaConfigPresence = true;
    });

    let secReceivedMediaConfigPresence = false;
    clientSockets.sec.on(SocketEvents.RECEIVED_MEDIA_CONFIG, () => {
      secReceivedMediaConfigPresence = true;
    });

    let fourthReceivedMediaConfigPresence = false;
    clientSockets.fourth.on(SocketEvents.RECEIVED_MEDIA_CONFIG, () => {
      fourthReceivedMediaConfigPresence = true;
    });

    targetClientSocket.emit(SocketEvents.SEND_MEDIA_CONFIG, validDataObj);

    await waitAfterEmit();
    const receivedMediaConfigRes = await receivedMediaConfigPromise;

    expect(receivedMediaConfigRes).toStrictEqual({
      userId: users.first.id,
      config: validDataObj.config,
    });

    expect(firstReceivedMediaConfigPresence).toBe(!isMainSocket);
    expect(secReceivedMediaConfigPresence).toBe(false);
    expect(fourthReceivedMediaConfigPresence).toBe(false);

    expect(checkIsSocketInRoom(serverSockets.first, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.sec, [firstRoom])).toBe(false);
    expect(checkIsSocketInRoom(serverSockets.third, [firstRoom])).toBe(true);
    expect(checkIsSocketInRoom(serverSockets.fourth, [secRoom])).toBe(true);
  }

  it("should properly send a media config (main socket)", async () =>
    await testSuccessfulSendMediaConfig(true));

  it("should properly send a media config (non-main socket)", async () =>
    await testSuccessfulSendMediaConfig(false));

  it("should return an error message when trying to send a media config while being missing in any room", async () => {
    const { clientSockets } = await setupSockets(false);
    const sendMediaConfigPromise = waitFor(
      clientSockets.third,
      SocketResponseEvents.SEND_MEDIA_CONFIG,
    );

    clientSockets.third.emit(SocketEvents.SEND_MEDIA_CONFIG, validDataObj);

    const res = await sendMediaConfigPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.NOT_INSIDE_ANY_ROOM,
    });
  });

  it("should return an error message if invalid data is provided", async () => {
    const { clientSockets } = await setupSockets();
    const sendMediaConfigPromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.SEND_MEDIA_CONFIG,
    );

    clientSockets.first.emit(SocketEvents.SEND_MEDIA_CONFIG, invalidDataObj);

    const res = await sendMediaConfigPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.INVALID_DATA,
    });
  });

  it("should return an error message if an unexpected error is thrown", async () => {
    vi.spyOn(
      sharedModule,
      "getZodSendMediaConfigDataValidation",
    ).mockRejectedValue(new Error("Unexpected Error"));

    const { clientSockets } = await setupSockets();
    const sendMediaConfigPromise = waitFor(
      clientSockets.first,
      SocketResponseEvents.SEND_MEDIA_CONFIG,
    );

    clientSockets.first.emit(SocketEvents.SEND_MEDIA_CONFIG, validDataObj);

    const res = await sendMediaConfigPromise;
    expect(res).toStrictEqual({
      error: SocketResponseErrorMessages.UNEXPECTED_ERROR,
    });
  });
});
