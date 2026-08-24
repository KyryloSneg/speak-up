import { useMediaSettingsStore } from "@/stores/mediaSettings";

function getIsPhysicalCameraSelected(
  camera: MediaDeviceInfo,
  selectedCamera?: MediaDeviceInfo["deviceId"],
): boolean {
  const mediaSettingsStore = useMediaSettingsStore();
  const selectedCameraToUse =
    selectedCamera || mediaSettingsStore.selectedCamera;

  return [
    selectedCameraToUse,
    ...(selectedCameraToUse === mediaSettingsStore.defaultCamera
      ? ["default", mediaSettingsStore.defaultCamera]
      : []),
  ].includes(camera.deviceId);
}

export default getIsPhysicalCameraSelected;
