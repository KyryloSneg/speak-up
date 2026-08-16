import useSingleUserMediaStream from "@/composables/useSingleUserMediaStream";
import useSingleUserMediaStreamFallback from "@/composables/useSingleUserMediaStreamFallback";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { mockDevices } from "@/tests/utils/mediaConsts";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

const mockFallbackStream = ref<MediaStream | null>(null);
const mockFallbackTrack = ref<MediaStreamTrack | null>(null);

const mockFallbackStart = vi.fn();
const mockFallbackStop = vi.fn();

vi.mock("@/composables/useSingleUserMediaStreamFallback", () => ({
  default: vi.fn(() => ({
    stream: mockFallbackStream,
    track: mockFallbackTrack,
    start: mockFallbackStart,
    stop: mockFallbackStop,
  })),
}));

describe("useSingleUserMediaStream", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();

    vi.clearAllMocks();

    mockFallbackStream.value = null;
    mockFallbackTrack.value = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountTestComponent(
    type: "audio" | "video" = "audio",
    isManual = false,
  ) {
    let result: ReturnType<typeof useSingleUserMediaStream> | undefined;

    const Component = defineComponent({
      setup() {
        result = useSingleUserMediaStream(type, isManual);
        return {};
      },
      template: "<div></div>",
    });

    const wrapper = mount(Component);
    return { wrapper, result: result! };
  }

  it("should initialize fallback composable with manual mode set to true", () => {
    mountTestComponent("audio", false);

    expect(useSingleUserMediaStreamFallback).toHaveBeenCalledWith(
      "audio",
      true,
    );
  });

  describe("Primary Media Store Active", () => {
    it("should return primary media store audio stream and track when active", () => {
      const mediaStore = useMediaStore();

      const mockAudioTrack = new MediaStreamTrack();
      (mockAudioTrack as any).kind = "audio";

      const mockStream = new MediaStream([mockAudioTrack]);

      mediaStore.hasStartedMedia = true;
      mediaStore.config = { audio: true, video: false };
      mediaStore.userMediaStream = mockStream;
      mediaStore.userAudioTrack = mockAudioTrack;

      const { result } = mountTestComponent("audio", true);

      expect(result.value.stream.value).toBe(mockStream);
      expect(result.value.track.value).toBe(mockAudioTrack);
      expect(result.value.start).toBe(mediaStore.start);
      expect(result.value.stop).toBe(mediaStore.stop);
    });

    it("should return primary media store video track for video type", () => {
      const mediaStore = useMediaStore();

      const mockVideoTrack = new MediaStreamTrack();
      (mockVideoTrack as any).kind = "video";

      mediaStore.hasStartedMedia = true;
      mediaStore.config = { audio: false, video: true };
      mediaStore.userVideoTrack = mockVideoTrack;

      const { result } = mountTestComponent("video", true);

      expect(result.value.track.value).toBe(mockVideoTrack);
    });

    it("should call mediaStore.start and fallback.stop in automatic mode (!isManual)", () => {
      const mediaStore = useMediaStore();
      const startSpy = vi
        .spyOn(mediaStore, "start")
        .mockImplementation(async () => undefined);

      mediaStore.hasStartedMedia = true;
      mediaStore.config = { audio: true, video: false };

      const { result } = mountTestComponent("audio", false);
      const _ = result.value;

      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(mockFallbackStop).toHaveBeenCalledTimes(1);
    });

    it("should NOT call mediaStore.start or fallback.stop in manual mode (isManual = true)", () => {
      const mediaStore = useMediaStore();
      const startSpy = vi.spyOn(mediaStore, "start");

      mediaStore.hasStartedMedia = true;
      mediaStore.config = { audio: true, video: false };

      const { result } = mountTestComponent("audio", true);
      const _ = result.value;

      expect(startSpy).not.toHaveBeenCalled();
      expect(mockFallbackStop).not.toHaveBeenCalled();
    });
  });

  describe("Fallback Stream Active", () => {
    it("should return fallback object when primary media is inactive", () => {
      const mediaStore = useMediaStore();
      mediaStore.hasStartedMedia = false;

      const { result } = mountTestComponent("audio", true);

      expect(result.value.stream).toBe(mockFallbackStream);
      expect(result.value.track).toBe(mockFallbackTrack);
      expect(result.value.start).toBe(mockFallbackStart);
      expect(result.value.stop).toBe(mockFallbackStop);
    });

    it("should auto-start fallback stream when permissions are granted and devices exist (!isManual)", () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      mediaStore.hasStartedMedia = false;
      permissionsStore.microphone = "granted";
      mediaStore.devices = mockDevices;

      const { result } = mountTestComponent("audio", false);
      const _ = result.value;

      expect(mockFallbackStart).toHaveBeenCalledTimes(1);
    });

    it("should NOT auto-start fallback stream when permission is not granted", () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      mediaStore.hasStartedMedia = false;
      permissionsStore.microphone = "denied";
      mediaStore.devices = mockDevices;

      const { result } = mountTestComponent("audio", false);
      const _ = result.value;

      expect(mockFallbackStart).not.toHaveBeenCalled();
    });

    it("should NOT auto-start fallback stream when device list is empty", () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      mediaStore.hasStartedMedia = false;
      permissionsStore.microphone = "granted";
      mediaStore.devices = [];

      const { result } = mountTestComponent("audio", false);
      const _ = result.value;

      expect(mockFallbackStart).not.toHaveBeenCalled();
    });

    it("should NOT auto-start fallback stream in manual mode even if conditions are met", () => {
      const mediaStore = useMediaStore();
      const permissionsStore = usePermissionsStore();

      mediaStore.hasStartedMedia = false;
      permissionsStore.microphone = "granted";
      mediaStore.devices = mockDevices;

      const { result } = mountTestComponent("audio", true);
      const _ = result.value;

      expect(mockFallbackStart).not.toHaveBeenCalled();
    });
  });
});
