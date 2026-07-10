import mockSocket from "@/tests/unit/utils/mockSocket";
import bindToAllSocketEvents from "@/utils/bindToAllSocketEvents";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockHostStore,
  mockMediaStore,
  mockMessageStore,
  mockRoomStore,
  mockSocketStore,
  mockWebRTCStore,
} = vi.hoisted(() => ({
  mockHostStore: vi.fn(),
  mockMediaStore: vi.fn(),
  mockMessageStore: vi.fn(),
  mockRoomStore: vi.fn(),
  mockSocketStore: vi.fn(),
  mockWebRTCStore: vi.fn(),
}));

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("@/stores/host", () => ({
  useHostStore: () => ({ bindEvents: mockHostStore }),
}));

vi.mock("@/stores/media", () => ({
  useMediaStore: () => ({ bindEvents: mockMediaStore }),
}));

vi.mock("@/stores/message", () => ({
  useMessageStore: () => ({ bindEvents: mockMessageStore }),
}));

vi.mock("@/stores/room", () => ({
  useRoomStore: () => ({ bindEvents: mockRoomStore }),
}));

vi.mock("@/stores/socket", () => ({
  useSocketStore: () => ({ bindEvents: mockSocketStore }),
}));

vi.mock("@/stores/webrtc", () => ({
  useWebRTCStore: () => ({ bindEvents: mockWebRTCStore }),
}));

describe("bindToAllSocketEvents", () => {
  beforeEach(() => {
    mockSocket.resetMock();
    vi.clearAllMocks();
  });

  it("should properly clean up all previously attached event listeners and subscribe the new ones", () => {
    bindToAllSocketEvents();

    expect(mockSocket.off).toHaveBeenCalledExactlyOnceWith();

    expect(mockHostStore).toHaveBeenCalledOnce();
    expect(mockMediaStore).toHaveBeenCalledOnce();
    expect(mockMessageStore).toHaveBeenCalledOnce();
    expect(mockRoomStore).toHaveBeenCalledOnce();
    expect(mockSocketStore).toHaveBeenCalledOnce();
    expect(mockWebRTCStore).toHaveBeenCalledOnce();
  });
});
