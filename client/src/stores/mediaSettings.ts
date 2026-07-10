import { LocalStorageKeys } from "@/types/localStorage";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useMediaSettingsStore = defineStore("mediaSettings", () => {
  // ("default" is relevant only for the mic, not for the camera)
  const defaultMicrophone = ref("default");
  // change later to the actual one
  const defaultCamera = useStorage(LocalStorageKeys.DEFAULT_CAMERA, "default");

  const selectedMicrophone = useStorage(
    LocalStorageKeys.MICROPHONE,
    defaultMicrophone.value,
  );

  const selectedCamera = useStorage(
    LocalStorageKeys.CAMERA,
    defaultCamera.value,
  );

  const microphoneToUse = computed(() => selectedMicrophone.value);
  const cameraToUse = computed(() => {
    if (selectedCamera.value === "default") {
      // either a real default camera or "default" fallback
      return defaultCamera.value;
    }

    return selectedCamera.value;
  });

  const selectedDevices = computed<{ microphone: string; camera: string }>(
    () => ({
      microphone: microphoneToUse.value,
      camera: cameraToUse.value,
    }),
  );

  return {
    defaultMicrophone,
    defaultCamera,
    selectedMicrophone,
    selectedCamera,
    microphoneToUse,
    cameraToUse,
    selectedDevices,
  };
});
