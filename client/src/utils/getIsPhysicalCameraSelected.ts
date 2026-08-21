import { useMediaSettingsStore } from "@/stores/mediaSettings";

function getIsPhysicalCameraSelected(
  camera: MediaDeviceInfo,
  selectedCamera?: MediaDeviceInfo["deviceId"],
): boolean {
  const mediaSettingsStore = useMediaSettingsStore();
  const selectedCameraToUse =
    selectedCamera || mediaSettingsStore.selectedCamera;

  return [
    selectedCamera,
    ...(selectedCamera === mediaSettingsStore.defaultCamera
      ? ["default", mediaSettingsStore.defaultCamera]
      : []),
  ].includes(camera.deviceId);
}

export default getIsPhysicalCameraSelected;
