import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { watch } from "vue";

function useAreNewMessagesIndicator() {
  const authStore = useAuthStore();
  const chatStore = useChatStore();

  watch(
    () => chatStore.newMessagesUserIds,
    value => {
      if (!authStore.isAuth) return;
      chatStore.areNewMessages = value
        ? value.some(userId => userId !== authStore.user!.id)
        : false;
    },
  );

  watch(
    () => chatStore.isScrollDownButton,
    value => {
      if (!chatStore.areNewMessages) return;
      chatStore.areNewMessages = value;
    },
  );
}

export default useAreNewMessagesIndicator;
