import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { watch } from "vue";

function useStoppingUserMediaOnPermissionsDeny() {
  const mediaStore = useMediaStore();
  const permissionsStore = usePermissionsStore();

  watch(
    () =>
      permissionsStore.microphone === "denied" &&
      permissionsStore.camera === "denied",
    isEverythingDenied => {
      if (!isEverythingDenied) return;
      mediaStore.stop();
    },
  );
}

export default useStoppingUserMediaOnPermissionsDeny;
