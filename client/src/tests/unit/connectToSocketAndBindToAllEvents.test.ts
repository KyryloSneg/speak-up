import mockSocket from "@/tests/unit/utils/mockSocket";
import bindToAllSocketEvents from "@/utils/bindToAllSocketEvents";
import connectToSocketAndBindToAllEvents from "@/utils/connectToSocketAndBindToAllEvents";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("@/utils/bindToAllSocketEvents", () => ({ default: vi.fn() }));

describe("connectToSocketAndBindToAllEvents", () => {
  beforeEach(() => {
    mockSocket.resetMock();
    vi.clearAllMocks();
  });

  it("should properly connect to socket and bint to all events", () => {
    connectToSocketAndBindToAllEvents();

    expect(mockSocket.connect).toHaveBeenCalledOnce();
    expect(bindToAllSocketEvents).toHaveBeenCalledOnce();
  });
});
