import { useRoomStore } from "@/stores/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { useDebounceFn } from "@vueuse/core";
import { watch } from "vue";

function useInitSentMediaConfigCleanup() {
  const roomStore = useRoomStore();
  const debouncedCleanup = useDebounceFn(() => {
    roomStore.initSentMediaConfig = null;
  }, ROOM_STATE_CLEANUP_DEBOUNCE_MS);

  watch(() => roomStore.initSentMediaConfig, debouncedCleanup);
}

export default useInitSentMediaConfigCleanup;
