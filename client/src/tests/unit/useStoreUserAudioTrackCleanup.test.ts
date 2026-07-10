import useStoreUserAudioTrackCleanup from "@/composables/useStoreUserAudioTrackCleanup";
import { useMediaStore } from "@/stores/media";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("useStoreUserAudioTrackCleanup", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();
  });

  it("should cleanup audio track if user media is stopped", async () => {
    const mediaStore = useMediaStore();
    const audioTrack = new MediaStreamTrack();

    mediaStore.userMediaStream = new MediaStream([audioTrack]);
    mediaStore.userAudioTrack = audioTrack;

    useStoreUserAudioTrackCleanup();
    await nextTick();

    expect(mediaStore.userAudioTrack).toBe(audioTrack);

    mediaStore.userMediaStream = null;
    await nextTick();

    expect(mediaStore.userAudioTrack).toBeNull();
  });
});
