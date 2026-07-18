import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { useEventListener } from "@vueuse/core";
import { watch } from "vue";

function useGettingAllMediaDevices() {
  const permissionsStore = usePermissionsStore();
  const mediaStore = useMediaStore();

  const updateDevices = async () => {
    const mic = permissionsStore.microphone;
    const camera = permissionsStore.camera;

    if (mic === "denied" && camera === "denied") {
      mediaStore.devices = [];
      return;
    }

    // force using always fresh devices here
    // (useDeviceList works fine but it ignores transition from "denied" to
    // "granted" permission states)
    const devices = await navigator.mediaDevices.enumerateDevices();

    mediaStore.devices = [
      ...(mic === "granted"
        ? devices.filter(device => device?.kind === "audioinput")
        : []),
      ...(camera === "granted"
        ? devices.filter(device => device?.kind === "videoinput")
        : []),
    ];
  };

  if (typeof navigator !== "undefined" && navigator.mediaDevices) {
    useEventListener(navigator.mediaDevices, "devicechange", updateDevices);
  }

  watch(
    [() => permissionsStore.camera, () => permissionsStore.microphone],
    updateDevices,
    { immediate: true },
  );
}

export default useGettingAllMediaDevices;
