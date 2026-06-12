import setupSocketTests from "#tests/socket/utils/setupSocketTests.ts";
import waitForClientSocketsConnect from "#tests/socket/utils/waitForClientSocketsConnect.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import type { IOClientSocket } from "#types/socket.ts";
import { io as createClient } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("Socket server API (socket.io) CORS Policy", () => {
  let socket: IOClientSocket | undefined;
  let testKit: Awaited<ReturnType<typeof setupSocketTests>>;

  setupDbCleanup();
  beforeEach(async () => {
    testKit = await setupSocketTests();
  });

  afterEach(async () => {
    await testKit.cleanup();
  });

  afterEach(() => {
    socket?.disconnect();
  });

  it("should allow whitelisted origins to create a connection", async () => {
    const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
    socket = createClient(`ws://localhost:${process.env.PORT}`, {
      transports: ["websocket"],
      extraHeaders: { Origin: process.env.CLIENT_URL! },
      auth: { accessToken: tokens.accessToken },
      forceNew: true,
    });

    await waitForClientSocketsConnect(socket);
    expect(socket.connected).toBe(true);
  });

  it("should disallow non-whitelisted origins to create a connection", async () => {
    const { tokens } = await createAuthUser(getUniqueMockUserWithoutId());
    socket = createClient(`ws://localhost:${process.env.PORT}`, {
      transports: ["websocket"],
      extraHeaders: { Origin: "http://3rd-party.com" },
      auth: { accessToken: tokens.accessToken },
      forceNew: true,
    });

    const dataArray = await waitForClientSocketsConnect(socket);

    expect((dataArray[0] as { message: unknown }).message).toBeTypeOf("string");
    expect(socket.connected).toBe(false);
  });
});
