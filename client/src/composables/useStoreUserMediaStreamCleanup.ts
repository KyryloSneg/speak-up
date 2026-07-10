import { useMediaStore } from "@/stores/media";
import { watch } from "vue";

function useStoreUserMediaStreamCleanup() {
  const mediaStore = useMediaStore();

  watch(
    () => mediaStore.hasStartedMedia,
    () => {
      if (!mediaStore.hasStartedMedia) mediaStore.userMediaStream = null;
    },
  );
}

export default useStoreUserMediaStreamCleanup;
