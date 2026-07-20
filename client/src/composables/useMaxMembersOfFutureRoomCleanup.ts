import { useRoomStore } from "@/stores/room";
import { useDebounceFn } from "@vueuse/core";
import { watch } from "vue";

function useMaxMembersOfFutureRoomCleanup() {
  const roomStore = useRoomStore();
  const debouncedCleanup = useDebounceFn(() => {
    roomStore.maxMembersOfFutureRoom = null;
  }, 5000);

  watch(() => roomStore.maxMembersOfFutureRoom, debouncedCleanup);
}

export default useMaxMembersOfFutureRoomCleanup;
