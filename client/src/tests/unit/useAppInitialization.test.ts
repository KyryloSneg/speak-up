import useAppInitialization from "@/composables/useAppInitialization";
import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useCleanups from "@/composables/useCleanups";
import useRemoteScreenSharingsAutoCleanup from "@/composables/useRemoteScreenSharingsAutoCleanup";
import useRequestingFullScreen from "@/composables/useRequestingFullScreen";
import useRoomBeforeUnload from "@/composables/useRoomBeforeUnload";
import useScreenSharingAutoPin from "@/composables/useScreenSharingAutoPin";
import useSyncSharingScreenAnnouncerText from "@/composables/useSyncSharingScreenAnnouncerText";
import useUserSynchronization from "@/composables/useUserSynchronization";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/composables/useUserSynchronization", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useAuthMediaDevicesInitialization", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useRoomBeforeUnload", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useRemoteScreenSharingsAutoCleanup", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useScreenSharingAutoPin", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useRequestingFullScreen", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useSyncSharingScreenAnnouncerText", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useCleanups", () => ({
  default: vi.fn(),
}));

describe("useCleanups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should properly initialize the app", () => {
    useAppInitialization();

    expect(useUserSynchronization).toHaveBeenCalledOnce();
    expect(useAuthMediaDevicesInitialization).toHaveBeenCalledOnce();
    expect(useRoomBeforeUnload).toHaveBeenCalledOnce();
    expect(useRemoteScreenSharingsAutoCleanup).toHaveBeenCalledOnce();
    expect(useScreenSharingAutoPin).toHaveBeenCalledOnce();
    expect(useRequestingFullScreen).toHaveBeenCalledOnce();
    expect(useSyncSharingScreenAnnouncerText).toHaveBeenCalledOnce();
    expect(useCleanups).toHaveBeenCalledOnce();
  });
});
