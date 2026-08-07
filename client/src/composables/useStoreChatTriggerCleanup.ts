import { useRoomStore } from "@/stores/room";
import { watchEffect } from "vue";

function useStoreChatTriggerCleanup() {
  const roomStore = useRoomStore();

  watchEffect(() => {
    if (roomStore.openedWindow !== "chat") roomStore.chatTrigger = null;
  });
}

export default useStoreChatTriggerCleanup;
