<template>
  <UIButton
    size="icon-xl"
    variant="destructive"
    aria-label="Leave room"
    :class="styles.button"
    @click="roomStore.leaveRoom"
  >
    <LogOut />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { useRoomStore } from "@/stores/room";
import { LogOut } from "@lucide/vue";
import * as styles from "./LeaveRoom.css";

const roomStore = useRoomStore();
</script>
