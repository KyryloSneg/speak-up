import useIsMobile from "@/composables/useIsMobile";
import { useMediaStore } from "@/stores/media";
import { computed } from "vue";

function useCanFlipCamera() {
  const mediaStore = useMediaStore();
  const isMobile = useIsMobile();

  const canFlipCamera = computed(() => {
    if (!isMobile.value) return false;
    if (mediaStore.cameras.length < 2) return false;

    const labels = mediaStore.cameras.map(camera => camera.label.toLowerCase());
    const hasFront = labels.some(
      label =>
        label.includes("front") ||
        label.includes("user") ||
        label.includes("selfie"),
    );

    const hasBack = labels.some(
      label =>
        label.includes("back") ||
        label.includes("environment") ||
        label.includes("rear"),
    );

    if (labels.every(label => !label)) return mediaStore.cameras.length >= 2;
    return hasFront && hasBack;
  });

  return canFlipCamera;
}

export default useCanFlipCamera;
