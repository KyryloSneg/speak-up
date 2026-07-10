import { usePermissionsStore } from "@/stores/permissions";
import { usePermission } from "@vueuse/core";
import { watch } from "vue";

function useGettingMediaPermissions() {
  const permissionsStore = usePermissionsStore();

  const microphoneRef = usePermission("microphone");
  const cameraRef = usePermission("camera");

  watch(
    microphoneRef,
    value => {
      if (value) permissionsStore.microphone = value;
    },
    { immediate: true },
  );

  watch(
    cameraRef,
    value => {
      if (value) permissionsStore.camera = value;
    },
    { immediate: true },
  );

  const prevPromptedPermissions: {
    camera: boolean | null;
    microphone: boolean | null;
  } = {
    camera: null,
    microphone: null,
  };

  watch(
    [microphoneRef, cameraRef],
    ([microphonePermission, cameraPermission]) => {
      const isCameraPrompt = cameraPermission === "prompt";
      const isMicrophonePrompt = microphonePermission === "prompt";

      const isAllMediaPrompt = isCameraPrompt && isMicrophonePrompt;

      const hasCameraPromptChanged =
        isCameraPrompt && prevPromptedPermissions.camera !== isCameraPrompt;

      const hasMicrophonePromptChanged =
        isMicrophonePrompt &&
        prevPromptedPermissions.microphone !== isMicrophonePrompt;

      const isToPromptCamera = isAllMediaPrompt || hasCameraPromptChanged;
      const isToPromptMicrophone =
        isAllMediaPrompt || hasMicrophonePromptChanged;

      if (isToPromptCamera || isToPromptMicrophone) {
        navigator.mediaDevices
          ?.getUserMedia({
            video: isToPromptCamera,
            audio: isToPromptMicrophone,
          })
          .then(stream =>
            stream.getTracks().forEach(track => {
              track.stop();
            }),
          )
          .catch(() => {});

        prevPromptedPermissions.camera = isToPromptCamera;
        prevPromptedPermissions.microphone = isToPromptMicrophone;
      }
    },
    { immediate: true },
  );
}

export default useGettingMediaPermissions;
