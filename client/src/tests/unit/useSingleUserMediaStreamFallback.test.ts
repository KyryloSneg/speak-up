import useSingleUserMediaStreamFallback from "@/composables/useSingleUserMediaStreamFallback";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { usePermissionsStore } from "@/stores/permissions";
import { mockDevices, mockMicrophones } from "@/tests/utils/mediaConsts";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { mount } from "@vue/test-utils";
import { useUserMedia } from "@vueuse/core";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { toast } from "vue-sonner";

const mockStream = ref<MediaStream | null>(null);
const mockStart = vi.fn().mockResolvedValue(undefined);
const mockStop = vi.fn();

vi.mock("@vueuse/core", async importOriginal => {
  const actual = await importOriginal<typeof import("@speak-up/shared")>();
  return {
    ...actual,
    useUserMedia: vi.fn(() => ({
      stream: mockStream,
      start: mockStart,
      stop: mockStop,
    })),
  };
});

vi.mock("vue-sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useSingleUserMediaStreamFallback", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();

    vi.clearAllMocks();
    mockStream.value = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountTestComponent(
    type: "audio" | "video" = "audio",
    isManual = false,
  ) {
    let result: ReturnType<typeof useSingleUserMediaStreamFallback> | undefined;

    const Component = defineComponent({
      setup() {
        result = useSingleUserMediaStreamFallback(type, isManual);
        return {};
      },
      template: "<div></div>",
    });

    const wrapper = mount(Component);
    return { wrapper, composable: result! };
  }

  describe("Constraints & Device Selection", () => {
    it("should pass ideal constraints when selected device is 'default'", () => {
      const mediaSettingsStore = useMediaSettingsStore();
      mediaSettingsStore.selectedDevices.microphone = "default";

      mountTestComponent("audio", true);

      expect(useUserMedia).toHaveBeenCalledWith({
        constraints: expect.objectContaining({
          value: {
            audio: {
              deviceId: { ideal: "default" },
            },
          },
        }),
      });
    });

    it("should pass exact constraints when a specific device ID is selected", () => {
      const mediaSettingsStore = useMediaSettingsStore();
      mediaSettingsStore.selectedDevices.camera = "cam-device-id-123";

      mountTestComponent("video", true);

      expect(useUserMedia).toHaveBeenCalledWith({
        constraints: expect.objectContaining({
          value: {
            video: {
              deviceId: { exact: "cam-device-id-123" },
            },
          },
        }),
      });
    });
  });

  describe("Track Computed", () => {
    it("should return the first audio track for audio type", () => {
      const mockAudioTrack = new MediaStreamTrack();
      (mockAudioTrack as any).kind = "audio";

      mockStream.value = new MediaStream([mockAudioTrack]);

      const { composable } = mountTestComponent("audio", true);
      expect(composable.track.value).toBe(mockAudioTrack);
    });

    it("should return the first video track for video type", () => {
      const mockVideoTrack = new MediaStreamTrack();
      (mockVideoTrack as any).kind = "video";

      mockStream.value = new MediaStream([mockVideoTrack]);

      const { composable } = mountTestComponent("video", true);
      expect(composable.track.value).toBe(mockVideoTrack);
    });

    it("should return null if stream is not present", () => {
      mockStream.value = null;
      const { composable } = mountTestComponent("audio", true);

      expect(composable.track.value).toBeNull();
    });
  });

  describe("Start Function & Error Handling", () => {
    it("should call underlying start function when start() is invoked", async () => {
      const { composable } = mountTestComponent("audio", true);
      await composable.start();

      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it("should catch errors from start() and display a toast notification", async () => {
      const errorMessage = "Permission denied by system";
      mockStart.mockRejectedValueOnce(new Error(errorMessage));

      const { composable } = mountTestComponent("audio", true);
      await composable.start();

      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe("Automatic Mode (!isManual)", () => {
    it("should automatically start stream when permission is granted and devices are available", async () => {
      const permissionsStore = usePermissionsStore();
      const mediaStore = useMediaStore();

      permissionsStore.microphone = "granted";
      mediaStore.devices = mockDevices;

      mountTestComponent("audio", false);

      await nextTick();
      await Promise.resolve();

      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it("should call stop() if permission is revoked or not granted", async () => {
      const permissionsStore = usePermissionsStore();
      const mediaStore = useMediaStore();

      permissionsStore.microphone = "denied";
      mediaStore.devices = mockDevices;

      mountTestComponent("audio", false);
      await nextTick();

      expect(mockStop).toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
    });

    it("should stop existing stream before restarting when constraints change", async () => {
      const permissionsStore = usePermissionsStore();
      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();

      permissionsStore.microphone = "granted";

      mediaStore.devices = mockDevices;
      mockStream.value = new MediaStream();

      mountTestComponent("audio", false);
      mediaSettingsStore.selectedDevices.microphone =
        mockMicrophones[1]!.deviceId;

      await nextTick();
      await Promise.resolve();

      expect(mockStop).toHaveBeenCalled();
      expect(mockStart).toHaveBeenCalled();
    });
  });

  describe("Manual Mode (isManual = true)", () => {
    it("should NOT automatically start stream on mount even if permissions and devices are ready", async () => {
      const permissionsStore = usePermissionsStore();
      const mediaStore = useMediaStore();

      permissionsStore.microphone = "granted";
      mediaStore.devices = mockDevices;

      mountTestComponent("audio", true);

      await nextTick();
      await Promise.resolve();

      expect(mockStart).not.toHaveBeenCalled();
    });

    it("should restart stream on constraint change only when stream is already active", async () => {
      const mediaSettingsStore = useMediaSettingsStore();

      mediaSettingsStore.selectedDevices.microphone =
        mockMicrophones[0]!.deviceId;
      mockStream.value = new MediaStream();

      mountTestComponent("audio", true);

      mediaSettingsStore.selectedDevices.microphone =
        mockMicrophones[1]!.deviceId;

      await nextTick();

      expect(mockStop).toHaveBeenCalledTimes(1);
      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it("should NOT restart stream on constraint change if stream is null", async () => {
      const mediaSettingsStore = useMediaSettingsStore();

      mediaSettingsStore.selectedDevices.microphone =
        mockMicrophones[0]!.deviceId;
      mockStream.value = null;

      mountTestComponent("audio", true);

      mediaSettingsStore.selectedDevices.microphone =
        mockMicrophones[1]!.deviceId;

      await nextTick();

      expect(mockStop).not.toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
    });
  });
});
