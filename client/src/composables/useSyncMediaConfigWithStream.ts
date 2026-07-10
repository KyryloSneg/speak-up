import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { mediaDevice } from "@/utils/mediaDevice";
import { watch } from "vue";

function useSyncMediaConfigWithStream() {
  const mediaStore = useMediaStore();
  const mediaSettingsStore = useMediaSettingsStore();

  function cb(value: boolean, type: "audio" | "video"): void {
    if (!mediaStore.userMediaStream) return;

    const tracks =
      type === "audio"
        ? mediaStore.userMediaStream.getAudioTracks()
        : mediaStore.userMediaStream.getVideoTracks();

    const liveTracks = tracks.filter(track => track.readyState === "live");

    if (liveTracks.length) {
      mediaDevice.toggleUserMedia(type, value);
    } else {
      // request device
      const micOrCamStr = type === "audio" ? "microphone" : "camera";
      const otherDeviceStr = type === "audio" ? "camera" : "microphone";

      mediaStore.updateDevices({
        [micOrCamStr]: null,
        [otherDeviceStr]: mediaSettingsStore.selectedDevices[otherDeviceStr],
      });
    }
  }

  watch(
    () => mediaStore.config.audio,
    value => cb(value, "audio"),
  );

  watch(
    () => mediaStore.config.video,
    value => cb(value, "video"),
  );
}

export default useSyncMediaConfigWithStream;
