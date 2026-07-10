import useSyncSelectedDevicesWithUserMedia from "@/composables/useSyncSelectedDevicesWithUserMedia";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useSyncSelectedDevicesWithUserMedia", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should properly sync selected devices with user media", async () => {
    const mediaStore = useMediaStore();
    const mediaSettingsStore = useMediaSettingsStore();

    const updateDevicesSpy = vi.spyOn(mediaStore, "updateDevices");
    useSyncSelectedDevicesWithUserMedia();

    await nextTick();
    expect(updateDevicesSpy).not.toHaveBeenCalled();

    const firstPrevSelectedDevices = {
      ...mediaSettingsStore.selectedDevices,
    } as const;

    mediaSettingsStore.selectedMicrophone = "micId";
    await nextTick();

    expect(updateDevicesSpy).toHaveBeenLastCalledWith(firstPrevSelectedDevices);

    const secPrevSelectedDevices = {
      ...mediaSettingsStore.selectedDevices,
    } as const;

    mediaSettingsStore.selectedCamera = "camId";
    await nextTick();

    expect(updateDevicesSpy).toHaveBeenLastCalledWith(secPrevSelectedDevices);
    expect(updateDevicesSpy).toHaveBeenCalledTimes(2);
  });
});
