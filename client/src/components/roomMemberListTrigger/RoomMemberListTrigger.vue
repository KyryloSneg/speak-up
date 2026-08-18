<template>
  <slot
    v-if="isOpenedWindow"
    :isDialog="false"
    :dataId
    :value
    :click="isToggle ? toggle : open"
    v-bind="{
      'aria-label': ariaLabel,
      'aria-controls': memberListId,
      'aria-expanded': value,
    }"
  />
  <RoomBaseDialog v-else :open="value" @update:open="toggle">
    <template #trigger>
      <slot
        :isDialog="true"
        :dataId
        :value
        v-bind="{ 'aria-label': ariaLabel }"
      />
    </template>
    <template v-slot="slotProps">
      <RoomMemberListContent :data-slot="slotProps.dataSlot" />
    </template>
    <template #title>
      {{ ROOM_MEMBER_LIST_TITLE }}
    </template>
    <template #description> Complete list of all members of the room </template>
  </RoomBaseDialog>
</template>

<script setup lang="ts">
import RoomBaseDialog from "@/components/roomActions/baseDialog/RoomBaseDialog.vue";
import RoomMemberListContent from "@/components/roomWindow/memberList/content/RoomMemberListContent.vue";
import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { useRoomStore } from "@/stores/room";
import { ROOM_MEMBER_LIST_TITLE } from "@/utils/consts";
import { memberListId } from "@/utils/idConsts";
import { computed, useId } from "vue";

defineSlots<{
  default(props: {
    isDialog: boolean;
    dataId: string;
    value: boolean;
    "aria-label": string;
    "aria-controls"?: string;
    "aria-expanded"?: boolean;
    click?: () => void;
  }): unknown;
}>();

const { isToggle = false } = defineProps<{
  isToggle?: boolean;
}>();

function open() {
  roomStore.memberListTrigger = dataId;
  roomStore.openedWindow = "memberList";
}

function toggle() {
  roomStore.openedWindow = value.value ? null : "memberList";
  roomStore.memberListTrigger = roomStore.openedWindow ? dataId : null;
}

const roomStore = useRoomStore();
const dataId = useId();

// guard app from opening multiple drawers at the same time
const value = computed(
  () =>
    roomStore.memberListTrigger === dataId &&
    roomStore.openedWindow === "memberList",
);

const ariaLabel = computed(() =>
  isOpenedWindow.value && value.value && isToggle
    ? "Close member list"
    : "Open member list",
);

const isOpenedWindow = useIsRoomOpenedWindow();
</script>
