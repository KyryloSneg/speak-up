import { useMediaStore } from "@/stores/media";
import { useEventListener } from "@vueuse/core";
import { watch } from "vue";

function useSyncStoreUserAudioTrack() {
  const mediaStore = useMediaStore();

  function syncAudioTrack(): void {
    mediaStore.userAudioTrack =
      mediaStore.userMediaStream?.getAudioTracks()[0] || null;
  }

  useEventListener(
    () => mediaStore.userMediaStream,
    "addtrack",
    syncAudioTrack,
  );

  useEventListener(
    () => mediaStore.userMediaStream,
    "removetrack",
    syncAudioTrack,
  );

  useEventListener(
    () => mediaStore.userMediaStream,
    "customaddtrack",
    syncAudioTrack,
  );

  useEventListener(
    () => mediaStore.userMediaStream,
    "customremovetrack",
    syncAudioTrack,
  );

  watch(() => mediaStore.userMediaStream, syncAudioTrack, { immediate: true });
}

export default useSyncStoreUserAudioTrack;
