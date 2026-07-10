import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { watch } from "vue";

function useGettingDefaultCamera() {
  const mediaStore = useMediaStore();
  const mediaSettingsStore = useMediaSettingsStore();

  watch(
    [
      () => mediaStore.cameras,
      () => mediaSettingsStore.selectedCamera === "default",
    ],
    ([cameras, isPlaceholderCameraSelected]) => {
      if (!cameras.length) return;

      const defaultCameraId = cameras[0]?.deviceId;
      if (!defaultCameraId) return;

      if (isPlaceholderCameraSelected) {
        mediaSettingsStore.selectedCamera = defaultCameraId;
      }

      mediaSettingsStore.defaultCamera = defaultCameraId;
    },
  );
}

export default useGettingDefaultCamera;
