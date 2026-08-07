import { roomOpenedWindowBreakpoint } from "@/utils/breakpointConsts";
import { useMediaQuery } from "@vueuse/core";

function useIsRoomOpenedWindow() {
  const isRoomOpenedWindow = useMediaQuery(
    `(min-width: ${roomOpenedWindowBreakpoint})`,
  );

  return isRoomOpenedWindow;
}

export default useIsRoomOpenedWindow;
