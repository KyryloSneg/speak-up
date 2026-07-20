import { useHostStore } from "@/stores/host";
import { useRoomStore } from "@/stores/room";
import { useDebounceFn } from "@vueuse/core";
import { watch } from "vue";

function useUserIdsToRemoveCleanup() {
  const roomStore = useRoomStore();
  const hostStore = useHostStore();

  function cleanup(): void {
    hostStore.userIdsToRemove = [];
  }

  const debouncedCleanup = useDebounceFn(cleanup, 5000);

  watch(() => roomStore.room?.id, cleanup);
  watch(
    () => hostStore.userIdsToRemove,
    value => {
      if (!value.length) return;
      debouncedCleanup();
    },
    { deep: true },
  );
}

export default useUserIdsToRemoveCleanup;
