import { useRoomStore } from "@/stores/room";
import { useFullscreen } from "@vueuse/core";
import { ref, watch } from "vue";

function useRequestingFullScreen() {
  const roomStore = useRoomStore();

  const isFullscreenBeforeRequest = ref(false);
  const { isFullscreen, enter, exit } = useFullscreen();

  watch(
    () => roomStore.fullScreenItem,
    value => {
      if (!value) {
        if (!isFullscreenBeforeRequest.value) exit();
        return;
      }

      isFullscreenBeforeRequest.value = isFullscreen.value;
      enter();
    },
  );
}

export default useRequestingFullScreen;
