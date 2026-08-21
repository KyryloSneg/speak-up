import { useMediaStore } from "@/stores/media";
import { useWebRTCStore } from "@/stores/webrtc";
import { useEventListener } from "@vueuse/core";
import { watch } from "vue";

function useSendingWebRTCUserMedia() {
  const mediaStore = useMediaStore();

  function sendUserMedia(): void {
    const stream = mediaStore.userMediaStream;
    if (!stream) return;

    const webRTCStore = useWebRTCStore();
    webRTCStore.sendUserMedia(stream);
  }

  useEventListener(() => mediaStore.userMediaStream, "addtrack", sendUserMedia);
  useEventListener(
    () => mediaStore.userMediaStream,
    "removetrack",
    sendUserMedia,
  );

  useEventListener(
    () => mediaStore.userMediaStream,
    "customaddtrack",
    sendUserMedia,
  );

  useEventListener(
    () => mediaStore.userMediaStream,
    "customremovetrack",
    sendUserMedia,
  );

  watch(() => mediaStore.userMediaStream, sendUserMedia, { immediate: true });
}

export default useSendingWebRTCUserMedia;
