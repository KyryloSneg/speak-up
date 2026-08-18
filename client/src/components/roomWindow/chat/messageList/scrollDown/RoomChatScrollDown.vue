<template>
  <Transition :name="styles.transitionName">
    <UIButton
      v-if="chatStore.isScrollDownButton"
      size="icon"
      aria-label="Scroll down"
      aria-live="polite"
      :class="styles.button"
      @click="click"
    >
      <Transition :name="styles.alertTransitionName">
        <span
          v-if="chatStore.areNewMessages"
          :class="styles.alert"
          aria-hidden="true"
        >
          <CircleAlert />
        </span>
      </Transition>
      <span v-if="chatStore.areNewMessages" role="status" class="sr-only">
        New messages
      </span>
      <ChevronDown />
    </UIButton>
  </Transition>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { useChatStore } from "@/stores/chat";
import { ChevronDown, CircleAlert } from "@lucide/vue";
import * as styles from "./RoomChatScrollDown.css";

const chatStore = useChatStore();

function click(): void {
  const viewport = chatStore.scrollTemplateRef?.viewport;
  if (!viewport) return;

  function focusFallback(): void {
    viewport?.focus(); // pretty much useless but let it be
  }

  const messages = viewport.querySelectorAll('[data-message="true"]');

  if (messages) {
    let hasFocusedAnyMessage = false;
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i] as HTMLElement | undefined;
      if (!message) continue;

      message.focus();
      if (document.activeElement === message) {
        hasFocusedAnyMessage = true;
        break;
      }
    }

    if (!hasFocusedAnyMessage) focusFallback();
  } else {
    focusFallback();
  }

  chatStore.scrollTo(0, viewport.scrollHeight, { behavior: "smooth" });
}
</script>
