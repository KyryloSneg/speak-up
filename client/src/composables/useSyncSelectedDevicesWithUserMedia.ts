import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { FacingModes } from "@/types/media";
import getCameraFacingMode from "@/utils/getCameraFacingMode";
import getIsPhysicalCameraSelected from "@/utils/getIsPhysicalCameraSelected";
import { watch } from "vue";

function useSyncSelectedDevicesWithUserMedia() {
  const mediaStore = useMediaStore();
  const mediaSettingsStore = useMediaSettingsStore();

  watch(
    () => mediaSettingsStore.selectedDevices,
    (_, oldValue) => {
      mediaStore.updateDevices(oldValue);
      const currentCamera = mediaStore.cameras.find(camera =>
        getIsPhysicalCameraSelected(camera),
      );

      if (!currentCamera) return;
      mediaStore.isCameraFlipped =
        getCameraFacingMode(currentCamera) === FacingModes.ENVIRONMENT;
    },
  );
}

export default useSyncSelectedDevicesWithUserMedia;
