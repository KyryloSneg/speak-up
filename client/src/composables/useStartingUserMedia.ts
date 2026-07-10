import { useMediaStore } from "@/stores/media";
import { watchEffect } from "vue";

function useStartingUserMedia() {
  watchEffect(() => {
    const mediaStore = useMediaStore();
    if (!mediaStore.config.audio && !mediaStore.config.video) return;

    const areMicrophonesFetched = mediaStore.microphones.length !== 0;
    const areCamerasFetched = mediaStore.cameras.length !== 0;

    const areAllDevicesFetched =
      (!mediaStore.config.audio || areMicrophonesFetched) &&
      (!mediaStore.config.video || areCamerasFetched);

    if (areAllDevicesFetched) mediaStore.start();
  });
}

export default useStartingUserMedia;
