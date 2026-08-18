import { useChatStore } from "@/stores/chat";
import { useRoomStore } from "@/stores/room";
import { useEventListener } from "@vueuse/core";
import { watch } from "vue";

function useChatIsScrollDownButton() {
  const roomStore = useRoomStore();
  const chatStore = useChatStore();

  function cb(target: HTMLElement | null | undefined): void {
    if (!target) return;
    const distance =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    chatStore.scrolledPx = distance;
  }

  useEventListener(
    () => chatStore.scrollTemplateRef?.viewport,
    "scroll",
    e => {
      const target = e.target as HTMLElement;
      cb(target);
    },
    { passive: true },
  );

  watch(
    () => roomStore.room?.messages.length,
    () => cb(chatStore.scrollTemplateRef?.viewport),
  );
}

export default useChatIsScrollDownButton;
