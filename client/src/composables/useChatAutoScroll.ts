import { useChatStore } from "@/stores/chat";
import { watch } from "vue";

function useChatAutoScroll() {
  const chatStore = useChatStore();

  watch(
    () => chatStore.scrollTemplateRef?.viewport,
    viewport => {
      if (chatStore.isInitScrolled) return;
      if (!viewport) return;

      chatStore.scrollTo(0, viewport.scrollHeight);
      chatStore.isInitScrolled = true;
    },
  );
}

export default useChatAutoScroll;
