import useAudioNoiseGate from "@/composables/useAudioNoiseGate";
import setupFakeBrowserAudioContext, {
  FakeAnalyserNode,
  FakeAudioContext,
  FakeGainNode,
} from "@/tests/utils/setupFakeBrowserAudioContext";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";

describe("useAudioNoiseGate", () => {
  let scope: ReturnType<typeof effectScope>;

  function createMockTrack(
    kind: "audio" | "video",
    id = `track-${Math.random()}`,
  ) {
    const track = new MediaStreamTrack();

    Object.defineProperty(track, "kind", { value: kind });
    Object.defineProperty(track, "id", { value: id });

    return track;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    setupFakeBrowserAudioContext();

    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
    vi.useRealTimers();
  });

  it("should return null processedStream when input stream is null", () => {
    scope.run(() => {
      const streamRef = ref<MediaStream | null>(null);
      const processedStream = useAudioNoiseGate(streamRef);

      expect(processedStream.value).toBeNull();
    });
  });

  it("should create gated media stream when input stream has an audio track", async () => {
    await scope.run(async () => {
      const audioTrack = createMockTrack("audio");
      const inputStream = new MediaStream([audioTrack]);
      const streamRef = ref<MediaStream | null>(inputStream);

      const processedStream = useAudioNoiseGate(streamRef);
      await nextTick();

      expect(processedStream.value).toBeInstanceOf(MediaStream);
      expect(processedStream.value?.getAudioTracks().length).toBe(1);
    });
  });

  it("should pass through video tracks along with gated audio track", async () => {
    await scope.run(async () => {
      const audioTrack = createMockTrack("audio");
      const videoTrack = createMockTrack("video");
      const inputStream = new MediaStream([audioTrack, videoTrack]);
      const streamRef = ref<MediaStream | null>(inputStream);

      const processedStream = useAudioNoiseGate(streamRef);
      await nextTick();

      expect(processedStream.value?.getVideoTracks()).toContain(videoTrack);
      expect(processedStream.value?.getAudioTracks().length).toBe(1);
    });
  });

  it("should dynamic update output when streamRef changes or is reset to null", async () => {
    await scope.run(async () => {
      const audioTrack = createMockTrack("audio");
      const inputStream = new MediaStream([audioTrack]);
      const streamRef = ref<MediaStream | null>(inputStream);

      const processedStream = useAudioNoiseGate(streamRef);
      await nextTick();

      expect(processedStream.value).not.toBeNull();

      streamRef.value = null;
      await nextTick();

      expect(processedStream.value).toBeNull();
    });
  });

  it("should adjust gain target when speech volume exceeds threshold", async () => {
    await scope.run(async () => {
      const setTargetSpy = FakeGainNode.prototype.gain.setTargetAtTime;
      const audioTrack = createMockTrack("audio");
      const inputStream = new MediaStream([audioTrack]);
      const streamRef = ref(inputStream);

      useAudioNoiseGate(streamRef, 1.0, 400, 0.05);
      await nextTick();

      FakeAnalyserNode.volume = 10;

      vi.advanceTimersByTime(25);
      expect(setTargetSpy).toHaveBeenCalledWith(1.0, expect.any(Number), 0.015);
    });
  });

  it("should reduce gain to floor after hold time when volume drops below threshold", async () => {
    await scope.run(async () => {
      const setTargetSpy = FakeGainNode.prototype.gain.setTargetAtTime;
      const audioTrack = createMockTrack("audio");
      const inputStream = new MediaStream([audioTrack]);

      useAudioNoiseGate(ref(inputStream));
      await vi.advanceTimersByTimeAsync(50);

      FakeAnalyserNode.volume = 100;
      await vi.advanceTimersByTimeAsync(100);

      FakeAnalyserNode.volume = 0;
      FakeAudioContext.instances.forEach(ctx => {
        ctx.currentTime += 1.0;
      });

      await vi.advanceTimersByTimeAsync(600);
      expect(setTargetSpy).toHaveBeenLastCalledWith(
        0.05,
        expect.any(Number),
        0.08,
      );
    });
  });

  it("should cleanup audio nodes and close audio context on unmount", async () => {
    const closeSpy = FakeAudioContext.prototype.close;

    await scope.run(async () => {
      const audioTrack = createMockTrack("audio");
      const inputStream = new MediaStream([audioTrack]);
      const streamRef = ref(inputStream);

      useAudioNoiseGate(streamRef);
      await nextTick();
    });

    scope.stop();
    await nextTick();

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should update tracks dynamically when stream fires custom track events", async () => {
    await scope.run(async () => {
      const audioTrack = createMockTrack("audio");
      const inputStream = new MediaStream([audioTrack]);
      const streamRef = ref(inputStream);

      const processedStream = useAudioNoiseGate(streamRef);
      await nextTick();

      const newVideoTrack = createMockTrack("video");
      inputStream.addTrack(newVideoTrack);
      inputStream.dispatchEvent(new CustomEvent("customaddtrack"));

      expect(processedStream.value?.getVideoTracks()).toContain(newVideoTrack);
    });
  });
});
