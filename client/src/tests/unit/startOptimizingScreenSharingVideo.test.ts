import startOptimizingScreenSharingVideo from "@/utils/startOptimizingScreenSharingVideo";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("startOptimizingScreenSharingVideo", () => {
  let mockContext: {
    drawImage: ReturnType<typeof vi.fn>;
    getImageData: ReturnType<typeof vi.fn>;
  };
  let mockImageData: Uint8ClampedArray;
  let videoElementMock: HTMLVideoElement;

  function createMockTrack(
    id = `track-${Math.random()}`,
  ): MediaStreamTrack & { _triggerEnded: () => void } {
    const listeners = new Map<string, Array<() => void>>();

    return {
      id,
      contentHint: "",
      addEventListener: vi.fn((event: string, callback: () => void) => {
        const current = listeners.get(event) || [];
        listeners.set(event, [...current, callback]);
      }),
      removeEventListener: vi.fn(),
      _triggerEnded() {
        listeners.get("ended")?.forEach(cb => cb());
      },
    } as any;
  }

  function createMockSender(transportState = "connected") {
    let savedParams: any = {
      degradationPreference: "",
      encodings: [{}],
    };

    return {
      transport: { state: transportState },
      getParameters: vi.fn(() => structuredClone(savedParams)),
      setParameters: vi.fn(async newParams => {
        savedParams = structuredClone(newParams);
      }),

      get _savedParams() {
        return savedParams;
      },
    } as any;
  }

  beforeEach(() => {
    vi.useFakeTimers();

    mockImageData = new Uint8ClampedArray(32 * 18 * 4).fill(100);
    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: mockImageData }),
    };

    class FakeOffscreenCanvas {
      constructor(
        public width: number,
        public height: number,
      ) {}

      getContext() {
        return mockContext;
      }
    }

    vi.stubGlobal("OffscreenCanvas", FakeOffscreenCanvas);

    vi.stubGlobal(
      "MediaStream",
      class {
        constructor(public tracks: MediaStreamTrack[]) {}
      },
    );

    videoElementMock = document.createElement("video");

    vi.spyOn(videoElementMock, "play").mockResolvedValue();
    vi.spyOn(videoElementMock, "pause").mockImplementation(() => {});
    vi.spyOn(videoElementMock, "remove").mockImplementation(() => {});

    Object.defineProperty(videoElementMock, "readyState", {
      value: 4,
      writable: true,
    });

    vi.spyOn(document, "createElement").mockImplementation(tagName => {
      if (tagName === "video") return videoElementMock;
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should return a no-op cleanup if OffscreenCanvas is not supported in window", () => {
    vi.stubGlobal("OffscreenCanvas", undefined);
    const track = createMockTrack("canvas-test");
    const sender = createMockSender();

    const cleanup = startOptimizingScreenSharingVideo(track, sender);

    expect(cleanup).toBeTypeOf("function");
    expect(() => cleanup()).not.toThrow();
  });

  it("should initialize in 'motion' mode and update RTP sender parameters", async () => {
    const track = createMockTrack("init-test");
    const sender = createMockSender();

    const cleanup = startOptimizingScreenSharingVideo(track, sender);

    expect(track.contentHint).toBe("motion");
    expect(sender.getParameters).toHaveBeenCalled();

    await Promise.resolve();

    expect(sender.setParameters).toHaveBeenCalledWith(
      expect.objectContaining({
        degradationPreference: "maintain-framerate",
        encodings: [
          expect.objectContaining({
            maxBitrate: 5000000,
            scaleResolutionDownBy: 1.25,
            maxFramerate: 60,
          }),
        ],
      }),
    );

    cleanup();
  });

  it("should register additional senders to existing track record without recreating interval/canvas", async () => {
    const track = createMockTrack("multi-sender-test");
    const primarySender = createMockSender();
    const secondarySender = createMockSender();

    const firstCleanup = startOptimizingScreenSharingVideo(
      track,
      primarySender,
    );

    const secCleanup = startOptimizingScreenSharingVideo(
      track,
      secondarySender,
    );

    await Promise.resolve();
    expect(secondarySender.setParameters).not.toHaveBeenCalled();

    firstCleanup();
    secCleanup();
  });

  it("should trigger cleanup when track dispatches 'ended' event", () => {
    const track = createMockTrack("ended-test");
    const sender = createMockSender();

    const pauseSpy = vi.spyOn(videoElementMock, "pause");
    const removeSpy = vi.spyOn(videoElementMock, "remove");

    startOptimizingScreenSharingVideo(track, sender);
    track._triggerEnded();

    expect(pauseSpy).toHaveBeenCalled();
    expect(videoElementMock.srcObject).toBeNull();
    expect(removeSpy).toHaveBeenCalled();
  });

  it("should transition from 'motion' to 'detail' mode after static frames threshold", async () => {
    const track = createMockTrack("motion-to-detail-test");
    const sender = createMockSender();

    const cleanup = startOptimizingScreenSharingVideo(track, sender, {
      intervalMs: 100,
    });

    await Promise.resolve();
    expect(track.contentHint).toBe("motion");

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    await Promise.resolve();

    expect(track.contentHint).toBe("detail");
    expect(sender.setParameters).toHaveBeenLastCalledWith(
      expect.objectContaining({
        degradationPreference: "maintain-resolution",
        encodings: [
          expect.objectContaining({
            maxBitrate: 2500000,
            scaleResolutionDownBy: 1.0,
            maxFramerate: 30,
          }),
        ],
      }),
    );

    cleanup();
  });

  it("should transition back from 'detail' to 'motion' mode when motion is detected", async () => {
    const track = createMockTrack("detail-to-motion-test");
    const sender = createMockSender();

    const cleanup = startOptimizingScreenSharingVideo(track, sender, {
      intervalMs: 100,
    });

    await Promise.resolve();

    for (let i = 0; i < 5; i++) {
      await vi.advanceTimersByTimeAsync(100);
    }

    await Promise.resolve();
    expect(track.contentHint).toBe("detail");

    mockContext.getImageData.mockReturnValue({
      data: new Uint8ClampedArray(32 * 18 * 4).fill(255),
    });

    await vi.advanceTimersByTimeAsync(100);
    await Promise.resolve();

    expect(track.contentHint).toBe("motion");
    cleanup();
  });

  it("should auto-cleanup when all registered senders have closed transports", async () => {
    const track = createMockTrack("closed-transport-test");
    const closedSender = createMockSender("closed");
    const pauseSpy = vi.spyOn(videoElementMock, "pause");

    startOptimizingScreenSharingVideo(track, closedSender, {
      intervalMs: 100,
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(pauseSpy).toHaveBeenCalled();
  });

  it("should skip frame analysis if video Element readyState is less than 2", async () => {
    const track = createMockTrack("readystate-test");
    const sender = createMockSender();

    Object.defineProperty(videoElementMock, "readyState", {
      value: 1,
      writable: true,
    });

    const cleanup = startOptimizingScreenSharingVideo(track, sender, {
      intervalMs: 100,
    });

    await vi.advanceTimersByTimeAsync(100);

    expect(mockContext.drawImage).not.toHaveBeenCalled();
    cleanup();
  });
});
