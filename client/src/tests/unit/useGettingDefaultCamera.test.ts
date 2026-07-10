import useGettingDefaultCamera from "@/composables/useGettingDefaultCamera";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { mockCameras, mockDevices } from "@/tests/utils/mediaConsts";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("useGettingDefaultCamera", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should properly change default camera and the selected one", async () => {
    const mediaStore = useMediaStore();
    const mediaSettingsStore = useMediaSettingsStore();

    useGettingDefaultCamera();
    await nextTick();

    mediaStore.devices = mockDevices;
    await nextTick();

    const actualDefaultCameraId = mockCameras[0]!.deviceId;

    expect(mediaSettingsStore.defaultCamera).toBe(actualDefaultCameraId);
    expect(mediaSettingsStore.selectedDevices.camera).toBe(
      actualDefaultCameraId,
    );
  });

  it("should properly change default camera but leave the selected one as is if it's not the default camera", async () => {
    const mediaStore = useMediaStore();
    const mediaSettingsStore = useMediaSettingsStore();

    useGettingDefaultCamera();
    await nextTick();

    const cameraIdToBeSelected = mockCameras[1]!.deviceId;

    mediaStore.devices = mockDevices;
    mediaSettingsStore.selectedCamera = cameraIdToBeSelected;

    await nextTick();
    const actualDefaultCameraId = mockCameras[0]!.deviceId;

    expect(mediaSettingsStore.defaultCamera).toBe(actualDefaultCameraId);
    expect(mediaSettingsStore.selectedDevices.camera).toBe(
      cameraIdToBeSelected,
    );
  });

  it("should leave store as is if cameras aren't retrieved", async () => {
    const mediaSettingsStore = useMediaSettingsStore();

    const oldDefaultCamera = mediaSettingsStore.defaultCamera;
    const oldSelectedCamera = mediaSettingsStore.selectedDevices.camera;

    useGettingDefaultCamera();
    await nextTick();

    expect(oldDefaultCamera).toBe(mediaSettingsStore.defaultCamera);
    expect(oldSelectedCamera).toBe(mediaSettingsStore.selectedDevices.camera);
  });
});
