import { useMediaStore } from "@/stores/media";
import { watch } from "vue";

function useStoreUserAudioTrackCleanup() {
  const mediaStore = useMediaStore();

  watch(
    () => mediaStore.userMediaStream,
    () => {
      if (!mediaStore.userMediaStream) mediaStore.userAudioTrack = null;
    },
  );
}

export default useStoreUserAudioTrackCleanup;
