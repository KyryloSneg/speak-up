import useSyncStreamIsCameraFlipped from "@/composables/useSyncStreamIsCameraFlipped";
import { useMediaStore } from "@/stores/media";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useSyncStreamIsCameraFlipped", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should properly sync .isCameraFlipped value with user media", async () => {
    const mediaStore = useMediaStore();
    mediaStore.isCameraFlipped = false;

    const flipCameraSpy = vi.spyOn(mediaStore, "flipCamera");

    useSyncStreamIsCameraFlipped();
    await nextTick();

    expect(flipCameraSpy).not.toHaveBeenCalled();

    mediaStore.isCameraFlipped = true;
    await nextTick();

    expect(flipCameraSpy).toHaveBeenLastCalledWith(mediaStore.isCameraFlipped);

    mediaStore.isCameraFlipped = false;
    await nextTick();

    expect(flipCameraSpy).toHaveBeenLastCalledWith(mediaStore.isCameraFlipped);
    expect(flipCameraSpy).toHaveBeenCalledTimes(2);
  });
});
