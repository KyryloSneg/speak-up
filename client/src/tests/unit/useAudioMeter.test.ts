import useAudioMeter from "@/composables/useAudioMeter";
import setupFakeBrowserAudioContext from "@/tests/utils/setupFakeBrowserAudioContext";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, type Ref } from "vue";
import { toast } from "vue-sonner";

vi.mock("vue-sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useAudioMeter", () => {
  let reqAnimFrameCb: FrameRequestCallback | null = null;
  let mockCancelAnim: ReturnType<typeof vi.fn>;

  let trackRef: Ref<MediaStreamTrack | null>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();

    setupFakeBrowserMediaEngine();
    setupFakeBrowserAudioContext();

    trackRef = ref<MediaStreamTrack | null>(null);

    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((cb: FrameRequestCallback) => {
        reqAnimFrameCb = cb;
        return 101;
      }),
    );

    mockCancelAnim = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", mockCancelAnim);
  });

  function stepAnimationFrame() {
    if (reqAnimFrameCb) {
      const currCb = reqAnimFrameCb;
      reqAnimFrameCb = null;
      currCb(performance.now());
    }
  }

  describe("initialization and guards", () => {
    it("should remain at 0 volume and leave early if track is empty", () => {
      const scope = effectScope();
      scope.run(() => {
        const { volume } = useAudioMeter(() => trackRef.value);
        expect(volume.value).toBe(0);
      });
      expect(AudioContext).not.toHaveBeenCalled();
      scope.stop();
    });

    it("should properly start audio context chain if track is provided", () => {
      trackRef.value = new MediaStreamTrack();
      const scope = effectScope();
      scope.run(() => {
        useAudioMeter(() => trackRef.value);
      });
      expect(AudioContext).toHaveBeenCalledOnce();
      expect(AudioContext.prototype.resume).toHaveBeenCalledOnce();
      scope.stop();
    });

    it("should do nothing if a track with the same id as before is provided", () => {
      const initTrack = new MediaStreamTrack();
      trackRef.value = initTrack;

      const scope = effectScope();
      scope.run(() => {
        useAudioMeter(() => trackRef.value);
      });

      expect(AudioContext).toHaveBeenCalledOnce();

      const newTrack = new MediaStreamTrack();
      (newTrack.id as any) = initTrack.id;

      trackRef.value = newTrack;
      expect(AudioContext).toHaveBeenCalledOnce();
      scope.stop();
    });
  });

  describe("volume calculation", () => {
    it("should properly compute volume value depending on track byte frequency data", () => {
      const frequencySpy = vi
        .spyOn(AnalyserNode.prototype, "getByteFrequencyData")
        .mockImplementation((array: Uint8Array) => array.fill(150));

      trackRef.value = new MediaStreamTrack();
      const scope = effectScope();
      let volumeRef: Ref<number, number>;

      scope.run(() => {
        const { volume } = useAudioMeter(() => trackRef.value);
        volumeRef = volume;
      });

      stepAnimationFrame();
      volumeRef = volumeRef!;

      expect(volumeRef.value).toBe(100);
      scope.stop();

      frequencySpy.mockRestore();
    });

    it("should properly smooth volume and recalculate it reactively", () => {
      const dataSpy = vi.spyOn(AnalyserNode.prototype, "getByteFrequencyData");
      trackRef.value = new MediaStreamTrack();

      const scope = effectScope();
      let volumeRef: Ref<number, number>;

      scope.run(() => {
        const { volume } = useAudioMeter(() => trackRef.value);
        volumeRef = volume;
      });

      dataSpy.mockImplementation((array: Uint8Array) => array.fill(150));
      stepAnimationFrame();
      volumeRef = volumeRef!;

      expect(volumeRef.value).toBe(100);

      dataSpy.mockImplementation((array: Uint8Array) => array.fill(0));
      stepAnimationFrame();

      expect(volumeRef.value).toBe(80);
      scope.stop();

      dataSpy.mockRestore();
    });
  });

  describe("error handling", () => {
    it("should properly handle an error", async () => {
      const error = "Unexpected Error" as const;
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const createSourceSpy = vi
        .spyOn(AudioContext.prototype, "createMediaStreamSource")
        .mockImplementation(() => {
          throw new Error(error);
        });

      trackRef.value = new MediaStreamTrack();
      const scope = effectScope();

      scope.run(() => {
        const { volume } = useAudioMeter(() => trackRef.value);
        expect(volume.value).toBe(0);
      });

      await nextTick();

      expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
      expect(consoleSpy).toHaveBeenCalledOnce();

      scope.stop();
      await nextTick();

      createSourceSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe("cleanups", () => {
    it("should properly cleanup running nodes on track change", async () => {
      trackRef.value = new MediaStreamTrack();
      const scope = effectScope();

      scope.run(() => {
        useAudioMeter(() => trackRef.value);
      });

      expect(reqAnimFrameCb).not.toBeNull();
      stepAnimationFrame();

      trackRef.value = new MediaStreamTrack();
      await nextTick();

      expect(mockCancelAnim).toHaveBeenCalledWith(101);
      expect(AnalyserNode.prototype.disconnect).toHaveBeenCalledOnce();

      scope.stop();
    });

    it("should properly cleanup on scope lifecycle end", () => {
      trackRef.value = new MediaStreamTrack();
      const scope = effectScope();

      scope.run(() => {
        useAudioMeter(() => trackRef.value);
      });

      scope.stop();
      expect(AudioContext.prototype.close).toHaveBeenCalledOnce();
    });
  });
});
