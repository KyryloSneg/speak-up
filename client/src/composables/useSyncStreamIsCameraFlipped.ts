import { useMediaStore } from "@/stores/media";
import { watch } from "vue";

function useSyncStreamIsCameraFlipped() {
  const mediaStore = useMediaStore();

  watch(
    () => mediaStore.isCameraFlipped,
    value => mediaStore.flipCamera(value),
  );
}

export default useSyncStreamIsCameraFlipped;
