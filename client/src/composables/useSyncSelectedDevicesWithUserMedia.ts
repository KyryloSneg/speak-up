import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import { watch } from "vue";

function useSyncSelectedDevicesWithUserMedia() {
  const mediaStore = useMediaStore();
  const mediaSettingsStore = useMediaSettingsStore();

  watch(
    () => mediaSettingsStore.selectedDevices,
    (_, oldValue) => mediaStore.updateDevices(oldValue),
  );
}

export default useSyncSelectedDevicesWithUserMedia;
