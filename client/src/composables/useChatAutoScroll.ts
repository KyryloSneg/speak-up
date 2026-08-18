import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { useChatStore } from "@/stores/chat";
import { useRoomStore } from "@/stores/room";
import { watch } from "vue";

function useChatAutoScroll() {
  const roomStore = useRoomStore();
  const chatStore = useChatStore();

  const isOpenedWindow = useIsRoomOpenedWindow();

  watch(
    [
      () => roomStore.openedWindow === "chat",
      () => chatStore.scrollTemplateRef?.viewport,
      isOpenedWindow,
    ],
    ([isChatOpened, viewport, isOpenedWindow]) => {
      if (!isChatOpened) return;

      if (isOpenedWindow && chatStore.isInitScrolled) return;
      if (!viewport) return;

      const card = isOpenedWindow
        ? viewport.closest('[data-slot="card"]')
        : null;

      if (card) {
        const style = window.getComputedStyle(card);
        if (style.visibility === "hidden") return;
      }

      chatStore.scrollTo(0, viewport.scrollHeight);
      if (isOpenedWindow) chatStore.isInitScrolled = true;
    },
  );
}

export default useChatAutoScroll;
