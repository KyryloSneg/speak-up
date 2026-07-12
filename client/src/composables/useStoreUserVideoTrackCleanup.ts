import { useMediaStore } from "@/stores/media";
import { watch } from "vue";

function useStoreUserVideoTrackCleanup() {
  const mediaStore = useMediaStore();

  watch(
    () => mediaStore.userMediaStream,
    () => {
      if (!mediaStore.userMediaStream) mediaStore.userVideoTrack = null;
    },
  );
}

export default useStoreUserVideoTrackCleanup;
