import { usePermissionsStore } from "@/stores/permissions";
import { usePermission, useUserMedia } from "@vueuse/core";
import { watchEffect } from "vue";

function useGettingMediaPermissions() {
  const permissionsStore = usePermissionsStore();

  const micPermission = usePermission("microphone");
  const cameraPermission = usePermission("camera");

  const { start, stop } = useUserMedia({
    constraints: { video: true, audio: true },
  });

  const requestPermissions = async () => {
    try {
      await start();
    } catch {
    } finally {
      stop();
    }
  };

  requestPermissions();

  watchEffect(() => {
    if (micPermission.value) {
      permissionsStore.microphone = micPermission.value;
    }

    if (cameraPermission.value) {
      permissionsStore.camera = cameraPermission.value;
    }
  });
}

export default useGettingMediaPermissions;
