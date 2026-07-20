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
  <UICardContent :class="cn(baseStyles.content, styles.content)">
    <RoomMemberListContent />
  </UICardContent>
</template>

<script setup lang="ts">
import BaseCloseRoomWindowButton from "@/components/roomWindow/base/close/BaseCloseRoomWindowButton.vue";
import RoomMemberListContent from "@/components/roomWindow/memberList/content/RoomMemberListContent.vue";
import {
  UICardAction,
  UICardContent,
  UICardHeader,
  UICardTitle,
} from "@/components/ui/shadcn/card";
import { useRoomStore } from "@/stores/room";
import { memberListId, memberListToggleId } from "@/utils/consts";
import { cn } from "@/utils/shadcn/utils";
import { nextTick, useId, watch } from "vue";
import * as baseStyles from "../RoomWindow.css";
import * as styles from "./RoomMemberList.css";

const roomStore = useRoomStore();
const closeId = useId();

watch(
  () => roomStore.openedWindow,
  (value, oldValue) => {
    if (value === "memberList") {
      nextTick(() => {
        const viewport = document
          .getElementById(memberListId)
          ?.querySelector(
            "[data-reka-scroll-area-viewport]",
          ) as HTMLElement | null;

        const elem = viewport || document.getElementById(closeId);
        elem?.focus({ preventScroll: true });
      });
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
