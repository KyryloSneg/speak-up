import useIsMobile from "@/composables/useIsMobile";
import { useMediaStore } from "@/stores/media";
import { computed } from "vue";

export default function useCanFlipCamera() {
  const mediaStore = useMediaStore();
  const isMobile = useIsMobile();

  const canFlipCamera = computed(() => {
    if (!isMobile.value) return false;
    if (mediaStore.cameras.length === 0) return true;

    return mediaStore.cameras.length >= 2;
  });

  return canFlipCamera;
}
