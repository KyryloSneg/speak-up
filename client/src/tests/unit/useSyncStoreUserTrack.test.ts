import useSyncStoreUserTrack from "@/composables/useSyncStoreUserTrack";
import { useMediaStore } from "@/stores/media";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { effectScope, nextTick, type EffectScope } from "vue";

describe("useStoreUserAudioTrackCleanup", () => {
  let scope: EffectScope;

  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();

    scope = effectScope();
  });

  afterEach(() => {
    scope.stop();
  });

  function test(type: "audio" | "video"): void {
    const trackField =
      type === "audio"
        ? ("userAudioTrack" as const)
        : ("userVideoTrack" as const);

    const oppositeType: typeof type = type === "audio" ? "video" : "audio";

    function createTrack(trackType: typeof type = type): MediaStreamTrack {
      const track = new MediaStreamTrack();
      (track as any).kind = trackType;

      return track;
    }

    it("should properly assign track if user media is active", async () => {
      const mediaStore = useMediaStore();
      const track = createTrack();

      mediaStore.userMediaStream = null;

      scope.run(() => useSyncStoreUserTrack(type));
      expect(mediaStore[trackField]).toBeNull();

      mediaStore.userMediaStream = new MediaStream([
        createTrack(oppositeType),
        track,
      ]);

      await nextTick();
      expect(mediaStore[trackField]).toBe(track);
    });

    it("should cleanup track if user media is stopped", async () => {
      const mediaStore = useMediaStore();
      const track = createTrack();

      mediaStore.userMediaStream = new MediaStream([track]);
      mediaStore[trackField] = track;

      scope.run(() => useSyncStoreUserTrack(type));
      expect(mediaStore[trackField]).toBe(track);

      mediaStore.userMediaStream = null;
      await nextTick();

      expect(mediaStore[trackField]).toBeNull();
    });

    it("should sync track if it's added with 'customaddtrack' event dispatch", async () => {
      const mediaStore = useMediaStore();
      const track = createTrack();

      scope.run(() => useSyncStoreUserTrack(type));
      expect(mediaStore[trackField]).toBeNull();

      mediaStore.userMediaStream = new MediaStream([]);

      mediaStore.userMediaStream.addTrack(createTrack(oppositeType));
      mediaStore.userMediaStream.dispatchEvent(
        new CustomEvent("customaddtrack"),
      );

      await nextTick();
      expect(mediaStore[trackField]).toBeNull();

      mediaStore.userMediaStream.addTrack(track);
      mediaStore.userMediaStream.dispatchEvent(
        new CustomEvent("customaddtrack"),
      );

      await nextTick();
      expect(mediaStore[trackField]).toBe(track);

      const otherTrack = createTrack();

      mediaStore.userMediaStream.addTrack(otherTrack);
      mediaStore.userMediaStream.dispatchEvent(
        new CustomEvent("customaddtrack"),
      );

      await nextTick();
      expect(mediaStore[trackField]).toBe(track);
    });

    it("should sync track if it's removed with 'customremovetrack' event dispatch", async () => {
      const mediaStore = useMediaStore();
      const track = createTrack();
      const otherTrack = createTrack();

      const oppositeTrack = createTrack(oppositeType);
      mediaStore.userMediaStream = new MediaStream([
        track,
        otherTrack,
        oppositeTrack,
      ]);

      scope.run(() => useSyncStoreUserTrack(type));
      expect(mediaStore[trackField]).toBe(track);

      mediaStore.userMediaStream.removeTrack(oppositeTrack);
      mediaStore.userMediaStream.dispatchEvent(
        new CustomEvent("customremovetrack"),
      );

      await nextTick();
      expect(mediaStore[trackField]).toBe(track);

      mediaStore.userMediaStream.removeTrack(track);
      mediaStore.userMediaStream.dispatchEvent(
        new CustomEvent("customremovetrack"),
      );

      await nextTick();
      expect(mediaStore[trackField]).toBe(otherTrack);

      mediaStore.userMediaStream.removeTrack(otherTrack);
      mediaStore.userMediaStream.dispatchEvent(
        new CustomEvent("customremovetrack"),
      );

      await nextTick();
      expect(mediaStore[trackField]).toBeNull();
    });
  }

  describe("audio", () => test("audio"));
  describe("video", () => test("video"));
});
