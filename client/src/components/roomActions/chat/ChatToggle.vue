<template>
  <BaseAsideToggle
    v-if="isOpenedWindow"
    :value
    :size
    :aria-label="ariaLabel"
    :aria-controls="roomChatId"
    :aria-expanded="value"
    aria-keyshortcuts="Control+Alt+C Control+Meta+C"
    :id="roomChatToggleId"
    @click="toggle"
  >
    <MessageCircleOff v-if="value" />
    <MessageCircleMore v-else />
  </BaseAsideToggle>
  <RoomBaseDialog v-else :open="value" :handleAutofocus @update:open="toggle">
    <template #trigger>
      <BaseAsideToggle
        :value
        :size
        :aria-label="ariaLabel"
        aria-keyshortcuts="Control+Alt+C Control+Meta+C"
        :id="roomChatToggleId"
      >
        <MessageCircleMore />
      </BaseAsideToggle>
    </template>
    <template v-slot="slotProps">
      <RoomChatMessageList :data-slot="slotProps.dataSlot" />
    </template>
    <template #title>
      {{ ROOM_CHAT_TITLE }}
    </template>
    <template #description> Share your fascinating ideas with others </template>
    <template #footer>
      <ChatInput />
    </template>
  </RoomBaseDialog>
</template>

<script setup lang="ts">
import BaseAsideToggle from "@/components/roomActions/base/BaseAsideToggle.vue";
import RoomBaseDialog from "@/components/roomActions/baseDialog/RoomBaseDialog.vue";
import ChatInput from "@/components/roomWindow/chat/input/ChatInput.vue";
import RoomChatMessageList from "@/components/roomWindow/chat/messageList/RoomChatMessageList.vue";
import type { ButtonVariants } from "@/components/ui/shadcn/button";
import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { useRoomStore } from "@/stores/room";
import { ROOM_CHAT_TITLE } from "@/utils/consts";
import {
  roomChatId,
  roomChatInputId,
  roomChatToggleId,
} from "@/utils/idConsts";
import { MessageCircleMore, MessageCircleOff } from "@lucide/vue";
import { useEventListener } from "@vueuse/core";
import { computed, nextTick, onMounted } from "vue";

defineProps<{
  size: ButtonVariants["size"];
}>();

function toggle() {
  roomStore.openedWindow = value.value ? null : "chat";
}

const handleAutofocus = async (e: Event) => {
  e.preventDefault();

  await nextTick();
  const elem = (e.target as HTMLElement | null)?.querySelector(
    `[data-id="${roomChatInputId}"]`,
  ) as HTMLElement | null | undefined;

  elem?.focus(); // works only sometimes for the drawer
};

const roomStore = useRoomStore();
const value = computed(() => roomStore.openedWindow === "chat");

const ariaLabel = computed(() =>
  isOpenedWindow.value && value.value ? "Close chat" : "Open chat",
);

const isOpenedWindow = useIsRoomOpenedWindow();

onMounted(() => {
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (!e.altKey && !e.metaKey) return;
    if (!e.ctrlKey || e.code !== "KeyC") return;

    e.preventDefault();
    toggle();
  });
});
</script>
