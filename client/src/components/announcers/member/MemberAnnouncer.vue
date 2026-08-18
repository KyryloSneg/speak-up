<template>
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {{ roomStore.memberAnnouncerText }}
  </div>
</template>

<script setup lang="ts">
import { useRoomStore } from "@/stores/room";

const roomStore = useRoomStore();
</script>
