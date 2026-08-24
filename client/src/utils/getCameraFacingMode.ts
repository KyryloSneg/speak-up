import { FacingModes, type FacingMode } from "@/types/media";

function getCameraFacingMode(
  camera: MediaDeviceInfo | InputDeviceInfo,
): FacingMode {
  if ("getCapabilities" in camera) {
    const capabilities = camera.getCapabilities?.();
    if (capabilities?.facingMode && capabilities.facingMode.length > 0) {
      return capabilities.facingMode.includes(FacingModes.ENVIRONMENT)
        ? FacingModes.ENVIRONMENT
        : FacingModes.USER;
    }
  }

  const label = camera.label.toLowerCase();
  const hasBack =
    label.includes("back") ||
    label.includes("environment") ||
    label.includes("rear");

  return hasBack ? FacingModes.ENVIRONMENT : FacingModes.USER;
}

export default getCameraFacingMode;
