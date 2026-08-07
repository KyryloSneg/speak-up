import { useRoomStore } from "@/stores/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { useDebounceFn } from "@vueuse/core";
import { watch } from "vue";

function useMaxMembersOfFutureRoomCleanup() {
  const roomStore = useRoomStore();
  const debouncedCleanup = useDebounceFn(() => {
    roomStore.maxMembersOfFutureRoom = null;
  }, ROOM_STATE_CLEANUP_DEBOUNCE_MS);

  watch(() => roomStore.maxMembersOfFutureRoom, debouncedCleanup);
}

export default useMaxMembersOfFutureRoomCleanup;
