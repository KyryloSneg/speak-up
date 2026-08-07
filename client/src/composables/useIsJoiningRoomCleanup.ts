import { useRoomStore } from "@/stores/room";
import { ROOM_STATE_CLEANUP_DEBOUNCE_MS } from "@/utils/consts";
import { useDebounceFn } from "@vueuse/core";
import { watch } from "vue";

function useIsJoiningRoomCleanup() {
  const roomStore = useRoomStore();
  const debouncedCleanup = useDebounceFn(() => {
    // make it possible to retry the corresponding forms if something has gone
    // terribly wrong with the socket connection / response
    roomStore.isJoining = false;
    roomStore.roomIdUserIsTryingToJoin = null;
  }, ROOM_STATE_CLEANUP_DEBOUNCE_MS);

  watch(
    [() => roomStore.isJoining, () => roomStore.roomIdUserIsTryingToJoin],
    debouncedCleanup,
  );
}

export default useIsJoiningRoomCleanup;
