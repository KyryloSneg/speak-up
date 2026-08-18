import useMediaDevicesInitialization from "@/composables/useMediaDevicesInitialization";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGettingMediaPermissions,
  mockGettingAllMediaDevices,
  mockGettingDefaultCamera,
  mockSyncMediaConfigWithStream,
  mockSyncPermissionsWithMediaConfig,
  mockSyncSelectedDevicesWithUserMedia,
  mockSyncStreamIsCameraFlipped,
  mockSyncStoreUserTrack,
  mockSendingNewMediaConfig,
  mockSendingWebRTCUserMedia,
  mockStoppingUserMediaOnPermissionsDeny,
  mockStoreUserMediaStreamCleanup,
} = vi.hoisted(() => ({
  mockGettingMediaPermissions: vi.fn(),
  mockGettingAllMediaDevices: vi.fn(),
  mockGettingDefaultCamera: vi.fn(),
  mockSyncMediaConfigWithStream: vi.fn(),
  mockSyncPermissionsWithMediaConfig: vi.fn(),
  mockSyncSelectedDevicesWithUserMedia: vi.fn(),
  mockSyncStreamIsCameraFlipped: vi.fn(),
  mockSyncStoreUserTrack: vi.fn(),
  mockSendingNewMediaConfig: vi.fn(),
  mockSendingWebRTCUserMedia: vi.fn(),
  mockStoppingUserMediaOnPermissionsDeny: vi.fn(),
  mockStoreUserMediaStreamCleanup: vi.fn(),
}));

vi.mock("@/composables/useGettingAllMediaDevices", () => ({
  default: mockGettingAllMediaDevices,
}));

vi.mock("@/composables/useGettingDefaultCamera", () => ({
  default: mockGettingDefaultCamera,
}));

vi.mock("@/composables/useGettingMediaPermissions", () => ({
  default: mockGettingMediaPermissions,
}));

vi.mock("@/composables/useSendingNewMediaConfig", () => ({
  default: mockSendingNewMediaConfig,
}));

vi.mock("@/composables/useSendingWebRTCUserMedia", () => ({
  default: mockSendingWebRTCUserMedia,
}));

vi.mock("@/composables/useStoppingUserMediaOnPermissionsDeny", () => ({
  default: mockStoppingUserMediaOnPermissionsDeny,
}));

vi.mock("@/composables/useSyncStoreUserTrack", () => ({
  default: mockSyncStoreUserTrack,
}));

vi.mock("@/composables/useStoreUserMediaStreamCleanup", () => ({
  default: mockStoreUserMediaStreamCleanup,
}));

vi.mock("@/composables/useSyncMediaConfigWithStream", () => ({
  default: mockSyncMediaConfigWithStream,
}));

vi.mock("@/composables/useSyncPermissionsWithMediaConfig", () => ({
  default: mockSyncPermissionsWithMediaConfig,
}));

vi.mock("@/composables/useSyncSelectedDevicesWithUserMedia", () => ({
  default: mockSyncSelectedDevicesWithUserMedia,
}));

vi.mock("@/composables/useSyncStreamIsCameraFlipped", () => ({
  default: mockSyncStreamIsCameraFlipped,
}));

describe("useMediaDevicesInitialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should properly initialize media devices", () => {
    useMediaDevicesInitialization();

    expect(mockGettingMediaPermissions).toHaveBeenCalledOnce();
    expect(mockGettingAllMediaDevices).toHaveBeenCalledOnce();
    expect(mockGettingDefaultCamera).toHaveBeenCalledOnce();
    expect(mockSyncMediaConfigWithStream).toHaveBeenCalledOnce();
    expect(mockSyncPermissionsWithMediaConfig).toHaveBeenCalledOnce();
    expect(mockSyncSelectedDevicesWithUserMedia).toHaveBeenCalledOnce();
    expect(mockSyncStreamIsCameraFlipped).toHaveBeenCalledOnce();
    expect(mockSendingNewMediaConfig).toHaveBeenCalledOnce();
    expect(mockSendingWebRTCUserMedia).toHaveBeenCalledOnce();
    expect(mockStoppingUserMediaOnPermissionsDeny).toHaveBeenCalledOnce();
    expect(mockStoreUserMediaStreamCleanup).toHaveBeenCalledOnce();

    expect(mockSyncStoreUserTrack).toHaveBeenCalledTimes(2);
    expect(mockSyncStoreUserTrack).toHaveBeenCalledWith("audio");
    expect(mockSyncStoreUserTrack).toHaveBeenCalledWith("video");
  });
});
