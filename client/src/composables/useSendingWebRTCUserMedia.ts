import { useMediaStore } from "@/stores/media";
import { useWebRTCStore } from "@/stores/webrtc";
import { watchEffect } from "vue";

function useSendingWebRTCUserMedia() {
  const mediaStore = useMediaStore();

  watchEffect(() => {
    const stream = mediaStore.userMediaStream;
    if (!stream) return;

    const webRTCStore = useWebRTCStore();
    webRTCStore.sendUserMedia(stream);
  });
}

export default useSendingWebRTCUserMedia;
