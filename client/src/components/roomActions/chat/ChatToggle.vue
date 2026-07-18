<template>
  <BaseAsideToggle
    :value
    :aria-controls="roomChatId"
    :aria-expanded="value"
    :aria-label="value ? 'Close chat' : 'Open chat'"
    :id="roomChatToggleId"
    @click="toggle"
  >
    <MessageCircleOff v-if="value" />
    <MessageCircleMore v-else />
  </BaseAsideToggle>
</template>

<script setup lang="ts">
import BaseAsideToggle from "@/components/roomActions/base/BaseAsideToggle.vue";
import { useRoomStore } from "@/stores/room";
import { roomChatId, roomChatToggleId } from "@/utils/consts";
import { MessageCircleMore, MessageCircleOff } from "@lucide/vue";
import { computed } from "vue";

function toggle() {
  roomStore.openedWindow = roomStore.openedWindow === "chat" ? null : "chat";
}

const roomStore = useRoomStore();
const value = computed(() => roomStore.openedWindow === "chat");
</script>
