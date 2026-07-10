import { useMediaQuery } from "@vueuse/core";

function useIsMobile() {
  const isMobile = useMediaQuery("(pointer: coarse)");
  return isMobile;
}

export default useIsMobile;
