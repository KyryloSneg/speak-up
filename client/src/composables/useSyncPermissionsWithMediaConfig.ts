import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { watch } from "vue";

function useSyncPermissionsWithMediaConfig() {
  const mediaStore = useMediaStore();
  const permissionsStore = usePermissionsStore();

  watch(
    () => permissionsStore.microphone,
    permission => {
      if (permission !== "denied") return;
      mediaStore.config.audio = false;
    },
  );

  watch(
    () => permissionsStore.camera,
    permission => {
      if (permission !== "denied") return;
      mediaStore.config.video = false;
    },
  );
}

export default useSyncPermissionsWithMediaConfig;
