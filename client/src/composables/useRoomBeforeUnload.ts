import { useRoomStore } from "@/stores/room";
import { useEventListener } from "@vueuse/core";

function useRoomBeforeUnload() {
  const roomStore = useRoomStore();

  useEventListener(window, "beforeunload", e => {
    if (!roomStore.room) return;
    e.preventDefault();
  });
}

export default useRoomBeforeUnload;
