import useIsVideoActive from "@/composables/useIsVideoActive";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { objectEntries } from "@speak-up/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";

describe("useIsVideoActive", () => {
  beforeEach(() => {
    setupFakeBrowserMediaEngine();
    vi.clearAllMocks();
  });

  type MediaStreamTrackOptions = {
    [K in keyof MediaStreamTrack]: MediaStreamTrack[K];
  };

  function createTrack(
    options?: Partial<MediaStreamTrackOptions>,
  ): MediaStreamTrack {
    const track = new MediaStreamTrack();

    const trackDefaults = {
      kind: "video",
      enabled: true,
      muted: false,
      readyState: "live",
      ...options,
    };

    for (const [key, value] of objectEntries(trackDefaults as any)) {
      Object.defineProperty(track, key, {
        value,
        writable: true,
        configurable: true,
      });
    }

    return track;
  }

  function createMockStream(
    initialTracks: MediaStreamTrack[] = [],
  ): MediaStream {
    let tracks = [...initialTracks];
    const stream = new MediaStream(tracks);

    stream.getVideoTracks = vi.fn(() => tracks.filter(t => t.kind === "video"));

    const originalAddTrack = stream.addTrack.bind(stream);
    stream.addTrack = (track: MediaStreamTrack) => {
      if (!tracks.includes(track)) tracks.push(track);
      originalAddTrack(track);
    };

    const originalRemoveTrack = stream.removeTrack.bind(stream);
    stream.removeTrack = (track: MediaStreamTrack) => {
      tracks = tracks.filter(t => t !== track);
      originalRemoveTrack(track);
    };

    return stream;
  }

  it("should initialize as false when stream is null or undefined", () => {
    const streamRef = ref<MediaStream | null>(null);
    const isVideoActive = useIsVideoActive(streamRef);

    expect(isVideoActive.value).toBe(false);
  });

  it("should return true when stream has a live, unmuted, and enabled video track", () => {
    const activeTrack = createTrack();

    const stream = createMockStream([activeTrack]);
    const isVideoActive = useIsVideoActive(stream);

    expect(isVideoActive.value).toBe(true);
  });

  it("should return false if video track is muted, disabled, or ended", () => {
    const mutedTrack = createTrack({ muted: true });
    const disabledTrack = createTrack({ enabled: false });
    const endedTrack = createTrack({ readyState: "ended" });

    expect(useIsVideoActive(createMockStream([mutedTrack])).value).toBe(false);
    expect(useIsVideoActive(createMockStream([disabledTrack])).value).toBe(
      false,
    );

    expect(useIsVideoActive(createMockStream([endedTrack])).value).toBe(false);
  });

  it("should update state when track fires 'mute', 'unmute', 'enable', 'disable', or 'ended' events", () => {
    const track = createTrack();

    const stream = createMockStream([track]);
    const isVideoActive = useIsVideoActive(stream);

    expect(isVideoActive.value).toBe(true);

    (track.muted as any) = true;
    track.dispatchEvent(new Event("mute"));

    expect(isVideoActive.value).toBe(false);

    (track.muted as any) = false;
    track.dispatchEvent(new Event("unmute"));

    expect(isVideoActive.value).toBe(true);

    track.enabled = false;
    track.dispatchEvent(new Event("disable"));

    expect(isVideoActive.value).toBe(false);

    track.enabled = true;
    track.dispatchEvent(new Event("enable"));

    expect(isVideoActive.value).toBe(true);

    (track.readyState as any) = "ended";
    track.dispatchEvent(new Event("ended"));

    expect(isVideoActive.value).toBe(false);
  });

  it("should re-evaluate state when stream fires 'addtrack', 'removetrack', 'customaddtrack', or 'customremovetrack' events", () => {
    const stream = createMockStream();

    const isVideoActive = useIsVideoActive(stream);
    expect(isVideoActive.value).toBe(false);

    const track = createTrack();

    stream.addTrack(track);
    stream.dispatchEvent(new Event("addtrack"));
    expect(isVideoActive.value).toBe(true);

    stream.removeTrack(track);
    stream.dispatchEvent(new Event("removetrack"));
    expect(isVideoActive.value).toBe(false);

    stream.addTrack(track);
    stream.dispatchEvent(new Event("customaddtrack"));

    expect(isVideoActive.value).toBe(true);

    stream.removeTrack(track);
    stream.dispatchEvent(new Event("customremovetrack"));

    expect(isVideoActive.value).toBe(false);
  });

  it("should reactively update when streamRef changes from null to stream and back", async () => {
    const streamRef = ref<MediaStream | null>(null);
    const isVideoActive = useIsVideoActive(streamRef);

    expect(isVideoActive.value).toBe(false);
    const track = createTrack();

    const stream = createMockStream([track]);
    streamRef.value = stream;

    await nextTick();
    expect(isVideoActive.value).toBe(true);

    streamRef.value = null;

    await nextTick();
    expect(isVideoActive.value).toBe(false);
  });

  it("should clean up all event listeners when effect scope stops or stream changes", async () => {
    const track = createTrack();

    const stream = createMockStream([track]);

    const trackRemoveListenerSpy = vi.spyOn(track, "removeEventListener");
    const streamRemoveListenerSpy = vi.spyOn(stream, "removeEventListener");

    const scope = effectScope();

    scope.run(() => {
      useIsVideoActive(stream);
    });

    scope.stop();

    expect(trackRemoveListenerSpy).toHaveBeenCalledWith(
      "mute",
      expect.any(Function),
    );

    expect(trackRemoveListenerSpy).toHaveBeenCalledWith(
      "unmute",
      expect.any(Function),
    );

    expect(trackRemoveListenerSpy).toHaveBeenCalledWith(
      "enable",
      expect.any(Function),
    );

    expect(trackRemoveListenerSpy).toHaveBeenCalledWith(
      "disable",
      expect.any(Function),
    );

    expect(trackRemoveListenerSpy).toHaveBeenCalledWith(
      "ended",
      expect.any(Function),
    );

    expect(streamRemoveListenerSpy).toHaveBeenCalledWith(
      "addtrack",
      expect.any(Function),
    );

    expect(streamRemoveListenerSpy).toHaveBeenCalledWith(
      "removetrack",
      expect.any(Function),
    );

    expect(streamRemoveListenerSpy).toHaveBeenCalledWith(
      "customaddtrack",
      expect.any(Function),
    );

    expect(streamRemoveListenerSpy).toHaveBeenCalledWith(
      "customremovetrack",
      expect.any(Function),
    );
  });
});
