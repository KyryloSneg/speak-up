import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import { watchEffect } from "vue";

function useSendingNewMediaConfig() {
  const roomStore = useRoomStore();
  const mediaStore = useMediaStore();

  watchEffect(() => {
    if (!roomStore.room || roomStore.room.users.length < 2) return;
    mediaStore.sendMediaConfig(mediaStore.config);
  });
}

export default useSendingNewMediaConfig;
