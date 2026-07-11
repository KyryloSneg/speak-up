import prisma from "#services/prisma.ts";
import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { IOClientSocket, IOSocket } from "#types/socket.ts";
import app from "#utils/app.ts";
import {
  ApiRoutes,
  SocketEvents,
  SocketResponseEvents,
  type JWTTokens,
  type SocketServerToClientEventsData,
  type UserDto,
} from "@speak-up/shared";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const route = ApiRoutes.CHANGE_NICKNAME;

describe(`${route} PATCH route (socket interactions)`, () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await testKit.cleanup();
  });

  async function setupSockets(firstTokens: JWTTokens): Promise<{
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
    const { tokens: secTokens } = await createAuthUser(
      getUniqueMockUserWithoutId(),
    );

    const { tokens: thirdTokens } = await createAuthUser(
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
    await fourthCreateRoomPromise;

    const firstRoom = (firstCreateRoomRes as { id: string }).id;
    const thirdJoinRoomPromise = waitFor(
      thirdClientSocket,
      SocketResponseEvents.JOIN_ROOM,
    );

    thirdClientSocket.emit(SocketEvents.JOIN_ROOM, {
      id: firstRoom,
    });

    await thirdJoinRoomPromise;

    return {
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

  describe("successful nickname change", () => {
    it("should successfully change nickname with picture fields and properly notify other users / tabs about it", async () => {
      const { user, tokens, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const { clientSockets } = await setupSockets(tokens);
      const firstChangedNicknamePromise = waitFor(
        clientSockets.first,
        SocketEvents.CHANGED_NICKNAME,
      );

      const secChangedNicknamePromise = waitFor(
        clientSockets.sec,
        SocketEvents.CHANGED_NICKNAME,
      );

      const thirdChangedNicknamePromise = waitFor(
        clientSockets.third,
        SocketEvents.CHANGED_NICKNAME,
      );

      let fourthChangedNicknameEventPresence = false;
      clientSockets.fourth.on(SocketEvents.CHANGED_NICKNAME, () => {
        fourthChangedNicknameEventPresence = true;
      });

      const newNickname = `${user.nickname} 123`;
      const res = await request(app)
        .patch(route)
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      const { nickname, picture, letterPicture } = res.body as UserDto;

      (
        await Promise.all([
          firstChangedNicknamePromise,
          secChangedNicknamePromise,
          thirdChangedNicknamePromise,
        ])
      ).forEach(socketRes => {
        const matchObject: SocketServerToClientEventsData[typeof SocketEvents.CHANGED_NICKNAME] =
          { userId: user.id, nickname, letterPicture };

        if (picture !== user.picture) {
          matchObject.picture = picture;
        }

        expect(socketRes).toStrictEqual(matchObject);
      });

      expect(fourthChangedNicknameEventPresence).toBe(false);
    });

    it("should successfully change just nickname and properly notify other users / tabs about it", async () => {
      const { user, tokens, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const { clientSockets } = await setupSockets(tokens);
      const firstChangedNicknamePromise = waitFor(
        clientSockets.first,
        SocketEvents.CHANGED_NICKNAME,
      );

      const secChangedNicknamePromise = waitFor(
        clientSockets.sec,
        SocketEvents.CHANGED_NICKNAME,
      );

      const thirdChangedNicknamePromise = waitFor(
        clientSockets.third,
        SocketEvents.CHANGED_NICKNAME,
      );

      let fourthChangedNicknameEventPresence = false;
      clientSockets.fourth.on(SocketEvents.CHANGED_NICKNAME, () => {
        fourthChangedNicknameEventPresence = true;
      });

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch(route)
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.body).toBeDefined();
      expect(res.body).not.toBeNull();

      const { nickname } = res.body as UserDto;

      (
        await Promise.all([
          firstChangedNicknamePromise,
          secChangedNicknamePromise,
          thirdChangedNicknamePromise,
        ])
      ).forEach(socketRes => {
        const matchObject: SocketServerToClientEventsData[typeof SocketEvents.CHANGED_NICKNAME] =
          { userId: user.id, nickname } as const;

        expect(socketRes).toStrictEqual(matchObject);
      });

      expect(fourthChangedNicknameEventPresence).toBe(false);
    });
  });

  describe("unsuccessful nickname change", () => {
    it("shouldn't touch socket infrastructure at all if the DB update doesn't meet success", async () => {
      const { user, tokens, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const { clientSockets } = await setupSockets(tokens);
      vi.spyOn(prisma.user, "update").mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const newNickname = `${user.nickname} 123`;
      await request(app)
        .patch(route)
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      let firstChangedNicknameEventPresence = false;
      clientSockets.first.on(SocketEvents.CHANGED_NICKNAME, () => {
        firstChangedNicknameEventPresence = true;
      });

      let secChangedNicknameEventPresence = false;
      clientSockets.sec.on(SocketEvents.CHANGED_NICKNAME, () => {
        secChangedNicknameEventPresence = true;
      });

      let thirdChangedNicknameEventPresence = false;
      clientSockets.third.on(SocketEvents.CHANGED_NICKNAME, () => {
        thirdChangedNicknameEventPresence = true;
      });

      let fourthChangedNicknameEventPresence = false;
      clientSockets.fourth.on(SocketEvents.CHANGED_NICKNAME, () => {
        fourthChangedNicknameEventPresence = true;
      });

      expect(firstChangedNicknameEventPresence).toBe(false);
      expect(secChangedNicknameEventPresence).toBe(false);
      expect(thirdChangedNicknameEventPresence).toBe(false);
      expect(fourthChangedNicknameEventPresence).toBe(false);
    });

    it("shouldn't affect the main service if something goes wrong with the socket callback", async () => {
      await testKit.cleanup(); // io isn't defined since this cleanup
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = `${user.nickname} 123`;
      const res = await request(app)
        .patch(route)
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.ok).toBe(true);
    });
  });
});
