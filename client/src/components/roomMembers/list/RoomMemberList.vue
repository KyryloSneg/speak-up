<template>
  <aside v-show="roomStore.isMemberListOpened" aria-live="polite" :id="memberListId"   ">
    <!-- TODO: the content here is rendered only if the value states so -->
  </aside>
</template>

<script setup lang="ts">
import { useRoomStore } from "@/stores/room";
import { memberListId, roomChatId } from "@/utils/consts";
import { cn } from "@/utils/shadcn/utils";

const roomStore = useRoomStore();
</script>
