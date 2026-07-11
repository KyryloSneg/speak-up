import useRoomUserSynchronization from "@/composables/useRoomUserSynchronization";
import useUserSynchronization from "@/composables/useUserSynchronization";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composables/useRoomUserSynchronization", () => ({
  default: vi.fn(),
}));

describe("useUserSynchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should properly call all synchronization effects", () => {
    useUserSynchronization();
    expect(useRoomUserSynchronization).toHaveBeenCalledOnce();
  });
});
