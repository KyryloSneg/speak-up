import rejoiningUsersCleanupLoop, {
  FAILED_TO_REJOIN_MS,
  INTERVAL_MS,
} from "#cleanup/rejoiningUsersCleanupLoop.ts";
import type { IO } from "#types/socket.ts";
import rejoiningUserToRoomId from "#utils/rejoiningUserToRoomId.ts";
import rooms from "#utils/rooms.ts";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest";

vi.mock("#services/getRoomSockets.ts", () => ({
  default: vi.fn(),
}));

describe("rejoiningUsersCleanupLoop", () => {
  const mockIo = {} as unknown as IO;

  beforeEach(() => {
    vi.useFakeTimers();
    rooms.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should clean up offline user data while keeping the online one's", async () => {
    rejoiningUserToRoomId.set("firstUserId", {
      id: "roomId",
      createdAt: new Date(),
    });

    rejoiningUsersCleanupLoop(mockIo);
    await vi.advanceTimersByTimeAsync(INTERVAL_MS);

    rejoiningUserToRoomId.set("secUserId", {
      id: "roomId",
      createdAt: new Date(),
    });

    const advanceByMs =
      INTERVAL_MS *
      Math.max(Math.ceil(FAILED_TO_REJOIN_MS / INTERVAL_MS) - 1, 0);

    expect(rejoiningUserToRoomId.has("firstUserId")).toBe(true);
    await vi.advanceTimersByTimeAsync(advanceByMs);

    expect(rejoiningUserToRoomId.has("firstUserId")).toBe(false);
    expect(rejoiningUserToRoomId.has("secUserId")).toBe(true);

    await vi.advanceTimersByTimeAsync(advanceByMs);

    expect(rejoiningUserToRoomId.has("firstUserId")).toBe(false);
    expect(rejoiningUserToRoomId.has("secUserId")).toBe(false);
  });

  it("should override clear the previous interval if a new one was initialized", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const firstIntervalId = rejoiningUsersCleanupLoop(mockIo);
    const secIntervalId = rejoiningUsersCleanupLoop(mockIo);

    expectTypeOf(firstIntervalId).toEqualTypeOf<NodeJS.Timeout | null>();
    expectTypeOf(secIntervalId).toEqualTypeOf<NodeJS.Timeout | null>();

    expect(firstIntervalId).not.toBeNull();
    expect(secIntervalId).not.toBeNull();

    expect(clearIntervalSpy).toHaveBeenCalledWith(firstIntervalId);
    expect(firstIntervalId).not.toBe(secIntervalId);
  });
});
