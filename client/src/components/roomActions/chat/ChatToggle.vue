<template>
  <BaseAsideToggle
    :value="roomStore.isChatOpened"
    :aria-controls="roomChatId"
    :aria-expanded="roomStore.isChatOpened"
    :aria-label="roomStore.isChatOpened ? 'Close chat' : 'Open chat'"
    @click="roomStore.isChatOpened = !roomStore.isChatOpened"
  >
    <MessageCircleOff v-if="roomStore.isChatOpened" />
    <MessageCircleMore v-else />
  </BaseAsideToggle>
</template>

<script setup lang="ts">
import BaseAsideToggle from "@/components/roomActions/base/BaseAsideToggle.vue";
import { useRoomStore } from "@/stores/room";
import { roomChatId } from "@/utils/consts";
import { MessageCircleMore, MessageCircleOff } from "@lucide/vue";

const roomStore = useRoomStore();
</script>
