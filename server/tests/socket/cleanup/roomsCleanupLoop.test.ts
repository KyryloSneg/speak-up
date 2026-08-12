import roomsCleanupLoop, { INTERVAL_MS } from "#cleanup/roomsCleanupLoop.ts";
import getRoomSockets from "#services/getRoomSockets.ts";
import { testDeleteRoom } from "#tests/socket/utils/testDeleteRoom.ts";
import type { IO } from "#types/socket.ts";
import rooms from "#utils/rooms.ts";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
  type Mock,
} from "vitest";

vi.mock("#services/getRoomSockets.ts", () => ({
  default: vi.fn(),
}));

describe("roomsCleanupLoop", () => {
  const mockIo = {} as unknown as IO;

  beforeEach(() => {
    vi.useFakeTimers();
    rooms.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should clean up empty room while keeping the active one", async () => {
    rooms.set("emptyRoomId", { messages: [] } as any);
    rooms.set("activeRoomId", { messages: [] } as any);

    (getRoomSockets as Mock).mockImplementation(async (_, roomId) => {
      if (roomId === "activeRoomId") return [{ id: "socketId" }];

      return [];
    });

    roomsCleanupLoop(mockIo);

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);

    testDeleteRoom("emptyRoomId");
    expect(rooms.has("activeRoomId")).toBe(true);
  });

  it("should ignore a broken room on error", async () => {
    rooms.set("brokenRoomID", { messages: [] } as any);
    rooms.set("subsequentEmptyRoomId", { messages: [] } as any);

    (getRoomSockets as Mock).mockImplementation(async (_io, roomId) => {
      if (roomId === "brokenRoomID") throw new Error("Unexpected Error");

      return [];
    });

    roomsCleanupLoop(mockIo);

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);

    expect(rooms.has("brokenRoomID")).toBe(true);
    testDeleteRoom("subsequentEmptyRoomId");
  });

  it("should override clear the previous interval if a new one was initialized", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const firstIntervalId = roomsCleanupLoop(mockIo);
    const secIntervalId = roomsCleanupLoop(mockIo);

    expectTypeOf(firstIntervalId).toEqualTypeOf<NodeJS.Timeout | null>();
    expectTypeOf(secIntervalId).toEqualTypeOf<NodeJS.Timeout | null>();

    expect(firstIntervalId).not.toBeNull();
    expect(secIntervalId).not.toBeNull();

    expect(clearIntervalSpy).toHaveBeenCalledWith(firstIntervalId);
    expect(firstIntervalId).not.toBe(secIntervalId);
  });
});
