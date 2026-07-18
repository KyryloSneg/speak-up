<template>
  <UICardHeader :class="baseStyles.header">
    <UICardTitle as="h2">Members</UICardTitle>
    <UICardAction>
      <BaseCloseRoomWindowButton
        aria-label="Close member list"
        :aria-controls="memberListId"
        :id="closeId"
      />
    </UICardAction>
  </UICardHeader>
  <UICardContent> </UICardContent>
  <UICardFooter> </UICardFooter>
</template>

<script setup lang="ts">
import BaseCloseRoomWindowButton from "@/components/roomWindow/base/close/BaseCloseRoomWindowButton.vue";
import {
  UICardAction,
  UICardContent,
  UICardFooter,
  UICardHeader,
  UICardTitle,
} from "@/components/ui/shadcn/card";
import { useRoomStore } from "@/stores/room";
import { memberListId, memberListToggleId } from "@/utils/consts";
import { nextTick, useId, watch } from "vue";
import * as baseStyles from "../RoomWindow.css";

const roomStore = useRoomStore();
const closeId = useId();

watch(
  () => roomStore.openedWindow,
  (value, oldValue) => {
    if (value === "memberList") {
      // TODO: change to a proper component maybe?
      nextTick(() =>
        document.getElementById(closeId)?.focus({ preventScroll: true }),
      );
    } else if (value === null && oldValue === "memberList") {
      nextTick(() =>
        document
          .getElementById(memberListToggleId)
          ?.focus({ preventScroll: true }),
      );
    }
  },
);
</script>
