import getServerSocket from "#tests/socket/utils/getServerSocket.ts";
import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitFor from "#tests/socket/utils/waitFor.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import cleanupSocket from "#utils/cleanupSocket.ts";
import leaveRoom from "#utils/leaveRoom.ts";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#utils/leaveRoom.ts", async () => {
  const actualModule = await vi.importActual<
    typeof import("#utils/leaveRoom.ts")
  >("#utils/leaveRoom.ts");

  return {
    ...actualModule,
    default: vi.fn(actualModule.default),
  };
});

describe("cleanupSocket", () => {
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  it("should remove socket from every SOCKET room it's currently in and leave from ACTUAL room", async () => {
    const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
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

    await cleanupSocket(testKit.io, serverSocket);
    expect(leaveRoom).toHaveBeenCalledWith(testKit.io, serverSocket, {
      roomIdToLeave: room,
    });

    expect(serverSocket.rooms).toHaveLength(1);
    expect(serverSocket.rooms.has(serverSocket.id)).toBe(true);
  });
});
