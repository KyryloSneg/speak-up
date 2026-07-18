<template>
  <BaseAsideToggle
    :value
    :aria-controls="memberListId"
    :aria-expanded="value"
    :aria-label="value ? 'Close member list' : 'Open member list'"
    :id="memberListToggleId"
    @click="toggle"
  >
    <PanelRightClose v-if="value" />
    <Users v-else />
  </BaseAsideToggle>
</template>

<script setup lang="ts">
import BaseAsideToggle from "@/components/roomActions/base/BaseAsideToggle.vue";
import { useRoomStore } from "@/stores/room";
import { memberListId, memberListToggleId } from "@/utils/consts";
import { PanelRightClose, Users } from "@lucide/vue";
import { computed } from "vue";

function toggle() {
  roomStore.openedWindow =
    roomStore.openedWindow === "memberList" ? null : "memberList";
}

const roomStore = useRoomStore();
const value = computed(() => roomStore.openedWindow === "memberList");
</script>
