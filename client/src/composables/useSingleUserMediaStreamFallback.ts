import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { usePermissionsStore } from "@/stores/permissions";
import { useUserMedia } from "@vueuse/core";
import { computed, watch } from "vue";
import { toast } from "vue-sonner";

function useSingleUserMediaStreamFallback(
  type: "audio" | "video",
  isManual: boolean = false,
) {
  const micOrCamStr = computed(() =>
    type === "audio" ? "microphone" : "camera",
  );

  const mediaSettingsStore = useMediaSettingsStore();
  const mediaStore = useMediaStore();
  const permissionsStore = usePermissionsStore();

  const selectedDevice = computed(
    () => mediaSettingsStore.selectedDevices[micOrCamStr.value],
  );

  const constraints = computed(() => ({
    [type]: {
      deviceId: {
        [selectedDevice.value === "default" ? "ideal" : "exact"]:
          selectedDevice.value,
      },
    },
  }));

  const { stream, start: _start, stop } = useUserMedia({ constraints });

  const start = async () => {
    try {
      return await _start();
    } catch (e) {
      toast.error((e as Error).message);
      return;
    }
  };

  const track = computed(() => {
    if (!stream.value) return null;

    const tracks =
      type === "audio"
        ? stream.value.getAudioTracks()
        : stream.value.getVideoTracks();

    return tracks[0] || null;
  });

  if (!isManual) {
    const micsOrCamsStr = computed(() => `${micOrCamStr.value}s` as const);
    const isGranted = computed(
      () => permissionsStore[micOrCamStr.value] === "granted",
    );

    const areDevicesFetched = computed(
      () => mediaStore[micsOrCamsStr.value].length !== 0,
    );

    watch(
      [isGranted, areDevicesFetched, constraints],
      async (_, __, onCleanup) => {
        let isCancelled = false;
        onCleanup(() => {
          isCancelled = true;
        });

        if (isGranted.value && areDevicesFetched.value) {
          if (stream.value) stop();

          await Promise.resolve();
          if (isCancelled) return;

          await start();
        } else {
          stop();
        }
      },
      { immediate: true, deep: true },
    );
  } else {
    watch(
      constraints,
      async () => {
        if (stream.value) {
          stop();
          await start();
        }
      },
      { deep: true },
    );
  }

  return { stream, track, start, stop };
}

export default useSingleUserMediaStreamFallback;
