import useStartingUserMedia from "@/composables/useStartingUserMedia";
import { useMediaStore } from "@/stores/media";
import {
  mockCameras,
  mockDevices,
  mockMicrophones,
  mockUserMediaDevices,
} from "@/tests/utils/mediaConsts";
import setupFakeBrowserMediaEngine from "@/tests/utils/setupFakeBrowserMediaEngine";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useStartingUserMedia", () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ createSpy: vi.fn, stubActions: true }));
    setupFakeBrowserMediaEngine();
  });

  it("should properly start user media if all devices are requested and fetched", async () => {
    const mediaStore = useMediaStore();
    mediaStore.config = { audio: true, video: true };

    useStartingUserMedia();

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockMicrophones;

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockCameras;

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockUserMediaDevices;

    await nextTick();
    expect(mediaStore.start).toHaveBeenCalledOnce();

    mediaStore.devices = mockDevices;

    await nextTick();
    // .hasStartedMedia ensures that the actual logic will run only once
    expect(mediaStore.start).toHaveBeenCalledTimes(2);
  });

  it("should properly start user media if only mic is requested and fetched", async () => {
    const mediaStore = useMediaStore();
    mediaStore.config = { audio: true, video: false };

    useStartingUserMedia();

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockCameras;

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockMicrophones;

    await nextTick();
    expect(mediaStore.start).toHaveBeenCalledOnce();

    mediaStore.devices = mockDevices;

    await nextTick();
    expect(mediaStore.start).toHaveBeenCalledTimes(2);
  });

  it("should properly start user media if only camera is requested and fetched", async () => {
    const mediaStore = useMediaStore();
    mediaStore.config = { audio: false, video: true };

    useStartingUserMedia();

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockMicrophones;

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockCameras;

    await nextTick();
    expect(mediaStore.start).toHaveBeenCalledOnce();

    mediaStore.devices = mockDevices;

    await nextTick();
    expect(mediaStore.start).toHaveBeenCalledTimes(2);
  });

  it("should do nothing if no devices were requested", async () => {
    const mediaStore = useMediaStore();
    mediaStore.config = { audio: false, video: false };

    useStartingUserMedia();

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();

    mediaStore.devices = mockDevices;

    await nextTick();
    expect(mediaStore.start).not.toHaveBeenCalled();
  });
});
