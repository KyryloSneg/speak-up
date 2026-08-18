import useAreNewMessagesIndicator from "@/composables/useAreNewMessagesIndicator";
import useChatAutoScroll from "@/composables/useChatAutoScroll";
import useChatIsScrollDownButton from "@/composables/useChatIsScrollDownButton";
import { useChatStore } from "@/stores/chat";
import type { Message } from "@speak-up/shared";
import { useTemplateRef, watchEffect } from "vue";

export type NewMessagesUserIds = Message["userId"][] | null;

function useHandlingNewChatMessages(scrollRefKey: string) {
  const chatStore = useChatStore();
  const scrollTemplateRef =
    useTemplateRef<typeof chatStore.scrollTemplateRef>(scrollRefKey);

  watchEffect(() => {
    chatStore.scrollTemplateRef = scrollTemplateRef.value;
  });

  useAreNewMessagesIndicator();
  useChatIsScrollDownButton();
  useChatAutoScroll();

  return scrollTemplateRef;
}

export default useHandlingNewChatMessages;
