import { useMediaQuery } from "@vueuse/core";
import { computed } from "vue";

export default function useIsMobile() {
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const isMobileUserAgent = computed(() =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ),
  );

  const isMobile = computed(
    () => isCoarsePointer.value || isMobileUserAgent.value,
  );

  return isMobile;
}
