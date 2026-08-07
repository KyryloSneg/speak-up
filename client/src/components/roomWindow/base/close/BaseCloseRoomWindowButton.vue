<template>
  <UIButton
    size="icon-lg"
    variant="ghostDestructive"
    :aria-expanded="!!roomStore.openedWindow"
    @click="roomStore.openedWindow = null"
  >
    <X />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { useRoomStore } from "@/stores/room";
import { X } from "@lucide/vue";

const roomStore = useRoomStore();
</script>
