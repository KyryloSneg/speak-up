<template>
  <BaseAsideToggle
    :value="roomStore.isMemberListOpened"
    :aria-controls="memberListId"
    :aria-expanded="roomStore.isMemberListOpened"
    :aria-label="
      roomStore.isMemberListOpened ? 'Close member list' : 'Open member list'
    "
    @click="roomStore.isMemberListOpened = !roomStore.isMemberListOpened"
  >
    <PanelRightClose v-if="roomStore.isMemberListOpened" />
    <Users v-else />
  </BaseAsideToggle>
</template>

<script setup lang="ts">
import BaseAsideToggle from "@/components/roomActions/base/BaseAsideToggle.vue";
import { useRoomStore } from "@/stores/room";
import { memberListId } from "@/utils/consts";
import { PanelRightClose, Users } from "@lucide/vue";

const roomStore = useRoomStore();
</script>
