import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { usePermissionsStore } from "@/stores/permissions";
import { useUserMedia } from "@vueuse/core";
import { computed, onUnmounted, watch } from "vue";

function useSingleUserMediaStream(
  type: "audio" | "video",
  isManual: boolean = false,
) {
  const micOrCamStr = type === "audio" ? "microphone" : "camera";
  const mediaSettingsStore = useMediaSettingsStore();

  const selectedDevice = computed(
    () => mediaSettingsStore.selectedDevices[micOrCamStr],
  );

  const constraints = computed(() => ({
    [type]: {
      deviceId: {
        [selectedDevice.value === "default" ? "ideal" : "exact"]:
          selectedDevice.value,
      },
    },
  }));

  const { stream, start, stop } = useUserMedia({ constraints });
  const track = computed(() => {
    if (!stream.value) return null;

    const tracks =
      type === "audio"
        ? stream.value.getAudioTracks()
        : stream.value.getVideoTracks();

    return tracks[0] || null;
  });

  if (!isManual) {
    const mediaStore = useMediaStore();
    const permissionsStore = usePermissionsStore();

    const micsOrCamsStr = `${micOrCamStr}s` as const;
    const isGranted = computed(
      () => permissionsStore[micOrCamStr] === "granted",
    );

    const areDevicesFetched = computed(
      () => mediaStore[micsOrCamsStr].length !== 0,
    );

    watch(
      [isGranted, areDevicesFetched],
      () => {
        if (isGranted.value && areDevicesFetched.value) {
          start();
        } else {
          stop();
        }
      },
      { immediate: true },
    );

    onUnmounted(() => {
      stop();
    });
  }

  return { stream, track, start, stop };
}

export default useSingleUserMediaStream;
