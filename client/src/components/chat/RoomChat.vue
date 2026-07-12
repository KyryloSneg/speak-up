<template>
  <aside v-show="roomStore.isChatOpened" aria-live="polite" :id="roomChatId"   ">
    <!-- TODO: the content here is rendered only if the value states so -->
  </aside>
</template>

<script setup lang="ts">
import { useRoomStore } from "@/stores/room";
import { roomChatId } from "@/utils/consts";
import { cn } from "@/utils/shadcn/utils";

const roomStore = useRoomStore();
</script>
