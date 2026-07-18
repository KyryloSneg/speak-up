<template>
  <UIButton
    size="icon-lg"
    variant="ghost"
    aria-expanded="true"
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
