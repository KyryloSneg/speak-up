import useCleanups from "@/composables/useCleanups";
import useInitSentMediaConfigCleanup from "@/composables/useInitSentMediaConfigCleanup";
import useIsJoiningRoomCleanup from "@/composables/useIsJoiningRoomCleanup";
import useMaxMembersOfFutureRoomCleanup from "@/composables/useMaxMembersOfFutureRoomCleanup";
import useUserIdsToRemoveCleanup from "@/composables/useUserIdsToRemoveCleanup";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composables/useIsJoiningRoomCleanup", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useMaxMembersOfFutureRoomCleanup", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useInitSentMediaConfigCleanup", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useUserIdsToRemoveCleanup", () => ({
  default: vi.fn(),
}));

describe("useCleanups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should properly initialize all cleanups", () => {
    useCleanups();

    expect(useIsJoiningRoomCleanup).toHaveBeenCalledOnce();
    expect(useMaxMembersOfFutureRoomCleanup).toHaveBeenCalledOnce();
    expect(useInitSentMediaConfigCleanup).toHaveBeenCalledOnce();
    expect(useUserIdsToRemoveCleanup).toHaveBeenCalledOnce();
  });
});
