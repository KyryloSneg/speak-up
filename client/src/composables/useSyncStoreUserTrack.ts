import { useMediaStore } from "@/stores/media";
import { useEventListener } from "@vueuse/core";
import { watch } from "vue";

function useSyncStoreUserTrack(type: "audio" | "video") {
  const mediaStore = useMediaStore();

  function syncTrack(): void {
    const tracks =
      type === "audio"
        ? mediaStore.userMediaStream?.getAudioTracks()
        : mediaStore.userMediaStream?.getVideoTracks();

    mediaStore[type === "audio" ? "userAudioTrack" : "userVideoTrack"] =
      tracks?.[0] || null;
  }

  useEventListener(() => mediaStore.userMediaStream, "addtrack", syncTrack);
  useEventListener(() => mediaStore.userMediaStream, "removetrack", syncTrack);
  useEventListener(
    () => mediaStore.userMediaStream,
    "customaddtrack",
    syncTrack,
  );

  useEventListener(
    () => mediaStore.userMediaStream,
    "customremovetrack",
    syncTrack,
  );

  watch(() => mediaStore.userMediaStream, syncTrack, { immediate: true });
}

export default useSyncStoreUserTrack;
