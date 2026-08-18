import mapToUserDto from "#dtos/userDto.ts";
import type { User } from "#generated/prisma/client.ts";
import getRoomUsers from "#services/getRoomUsers.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("getRoomUsers", () => {
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
    users: { first: User; sec: User; third: User };
  }> {
    const { user: firstUser, tokens: firstUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { user: secUser, tokens: secUserTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { user: thirdUser, tokens: thirdUserTokens } = await createAuthUser(
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

    // use client events instead of direct ".join"s
    const createRoomEventDataPromise = waitFor(
      firstClientSocket,
      SocketResponseEvents.CREATE_ROOM,
    );

    const joinRoomEventDataPromise = waitFor(
      secClientSocket,
      SocketResponseEvents.JOIN_ROOM,
    );

    firstClientSocket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers: 10,
      mediaConfig: { audio: true, video: true },
    });

    const room = ((await createRoomEventDataPromise) as { id: string }).id;
    secClientSocket.emit(SocketEvents.JOIN_ROOM, {
      id: room,
      mediaConfig: { audio: true, video: true },
    });

    await joinRoomEventDataPromise;

    return {
      room,
      users: { first: firstUser, sec: secUser, third: thirdUser },
    };
  }

  it("should properly get dtos of room users", async () => {
    const { room, users } = await setupSockets();
    const userDtos = await getRoomUsers(testKit.io, room);

    expect(userDtos).toHaveLength(2);
    userDtos.forEach(dto => expect(dto).toStrictEqual(mapToUserDto(dto)));

    expect(userDtos).toContainEqual(mapToUserDto(users.first));
    expect(userDtos).toContainEqual(mapToUserDto(users.sec));

    // for fun's sake (previous "expect"s already ensure that this check is true)
    expect(userDtos).not.toContainEqual(mapToUserDto(users.third));
  });
});
