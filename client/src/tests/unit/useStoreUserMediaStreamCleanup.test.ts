import useStoreUserMediaStreamCleanup from "@/composables/useStoreUserMediaStreamCleanup";
import { useMediaStore } from "@/stores/media";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("useStoreUserMediaStreamCleanup", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setupFakeBrowserMediaEngine();
  });

  it("should cleanup user media if it's stopped", async () => {
    const mediaStore = useMediaStore();
    const stream = new MediaStream([]);

    mediaStore.hasStartedMedia = true;
    mediaStore.userMediaStream = stream;

    useStoreUserMediaStreamCleanup();
    await nextTick();

    expect(mediaStore.userMediaStream).toBe(stream);

    mediaStore.hasStartedMedia = false;
    await nextTick();

    expect(mediaStore.userMediaStream).toBeNull();
  });
});
