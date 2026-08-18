import useSyncMediaConfigWithStream from "@/composables/useSyncMediaConfigWithStream";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import setupFakeBrowserAudioContext from "@/tests/utils/setupFakeBrowserAudioContext";
import { mediaDevice } from "@/utils/mediaDevice";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

vi.mock("@/utils/mediaDevice", async importOriginal => {
  const actual = await importOriginal<typeof import("@/utils/mediaDevice")>();
  actual.mediaDevice.toggleUserMedia = vi.fn();

  return actual;
});

describe("useSyncMediaConfigWithStream", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    setupFakeBrowserMediaEngine();
    setupFakeBrowserAudioContext()

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountTestComponent() {
    const Component = defineComponent({
      setup() {
        useSyncMediaConfigWithStream();
        return {};
      },
      template: "<div></div>",
    });

    return mount(Component);
  }

  it("should do nothing when userMediaStream is null", async () => {
    mountTestComponent();

    const mediaStore = useMediaStore();
    const updateDevicesSpy = vi.spyOn(mediaStore, "updateDevices");

    mediaStore.userMediaStream = null;
    mediaStore.config.audio = true;
    mediaStore.config.video = true;

    await nextTick();

    expect(mediaDevice.toggleUserMedia).not.toHaveBeenCalled();
    expect(updateDevicesSpy).not.toHaveBeenCalled();
  });

  describe("Audio Toggle Syncing", () => {
    it("should toggle audio track when live audio tracks exist", async () => {
      mountTestComponent();

      const mediaStore = useMediaStore();
      const mockAudioTrack = new MediaStreamTrack();

      (mockAudioTrack as any).kind = "audio";
      (mockAudioTrack as any).readyState = "live";

      mediaStore.userMediaStream = new MediaStream([mockAudioTrack]);

      mediaStore.config.audio = false;
      await nextTick();

      mediaStore.config.audio = true;
      await nextTick();

      expect(mediaDevice.toggleUserMedia).toHaveBeenCalledWith("audio", true);
    });

    it("should call updateDevices requesting microphone when enabling audio without live audio tracks", async () => {
      mountTestComponent();

      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();
      const updateDevicesSpy = vi.spyOn(mediaStore, "updateDevices");

      mediaSettingsStore.selectedDevices.camera = "camera-device-id";
      mediaStore.userMediaStream = new MediaStream();

      mediaStore.config.audio = false;
      await nextTick();

      mediaStore.config.audio = true;
      await nextTick();

      expect(mediaDevice.toggleUserMedia).not.toHaveBeenCalled();
      expect(updateDevicesSpy).toHaveBeenCalledWith({
        microphone: null,
        camera: "camera-device-id",
      });
    });

    it("should not trigger toggle or updateDevices when disabling audio without live audio tracks", async () => {
      mountTestComponent();

      const mediaStore = useMediaStore();
      const updateDevicesSpy = vi.spyOn(mediaStore, "updateDevices");

      mediaStore.userMediaStream = new MediaStream();
      mediaStore.config.audio = false;

      await nextTick();

      expect(mediaDevice.toggleUserMedia).not.toHaveBeenCalled();
      expect(updateDevicesSpy).not.toHaveBeenCalled();
    });
  });

  describe("Video Toggle Syncing", () => {
    it("should toggle video track when live video tracks exist", async () => {
      mountTestComponent();
      const mediaStore = useMediaStore();

      const mockVideoTrack = new MediaStreamTrack();
      (mockVideoTrack as any).kind = "video";
      (mockVideoTrack as any).readyState = "live";

      mediaStore.userMediaStream = new MediaStream([mockVideoTrack]);
      mediaStore.config.video = false;

      await nextTick();
      expect(mediaDevice.toggleUserMedia).toHaveBeenCalledWith("video", false);
    });

    it("should call updateDevices requesting camera when enabling video without live video tracks", async () => {
      mountTestComponent();

      const mediaStore = useMediaStore();
      const mediaSettingsStore = useMediaSettingsStore();
      const updateDevicesSpy = vi.spyOn(mediaStore, "updateDevices");

      mediaSettingsStore.selectedDevices.microphone = "mic-device-id";
      mediaStore.userMediaStream = new MediaStream();

      mediaStore.config.video = false;
      await nextTick();

      mediaStore.config.video = true;
      await nextTick();

      expect(mediaDevice.toggleUserMedia).not.toHaveBeenCalled();
      expect(updateDevicesSpy).toHaveBeenCalledWith({
        camera: null,
        microphone: "mic-device-id",
      });
    });

    it("should ignore ended tracks when checking for live tracks", async () => {
      mountTestComponent();

      const mediaStore = useMediaStore();
      const updateDevicesSpy = vi.spyOn(mediaStore, "updateDevices");

      const endedVideoTrack = new MediaStreamTrack();
      (endedVideoTrack as any).kind = "video";
      (endedVideoTrack as any).readyState = "ended";

      mediaStore.userMediaStream = new MediaStream([endedVideoTrack]);
      mediaStore.config.video = false;

      await nextTick();

      mediaStore.config.video = true;
      await nextTick();

      expect(mediaDevice.toggleUserMedia).not.toHaveBeenCalled();
      expect(updateDevicesSpy).toHaveBeenCalled();
    });
  });
});
