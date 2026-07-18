import { useRoomStore } from "@/stores/room";
import { useDebounceFn } from "@vueuse/core";
import { watch } from "vue";

function useIsJoiningRoomCleanup() {
  const roomStore = useRoomStore();
  const debouncedCleanup = useDebounceFn(() => {
    // make it possible to retry the corresponding forms if something has gone
    // terribly wrong with the socket connection / response
    roomStore.isJoining = false;
    roomStore.roomIdUserIsTryingToJoin = null;
  }, 5000);

  watch(
    [() => roomStore.isJoining, () => roomStore.roomIdUserIsTryingToJoin],
    debouncedCleanup,
  );
}

export default useIsJoiningRoomCleanup;
