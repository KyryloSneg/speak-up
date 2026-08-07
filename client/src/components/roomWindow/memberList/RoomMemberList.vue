<template>
  <UICardHeader :class="baseStyles.header">
    <UICardTitle as="h2">{{ ROOM_MEMBER_LIST_TITLE }}</UICardTitle>
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
import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { useRoomStore } from "@/stores/room";
import { ROOM_MEMBER_LIST_TITLE } from "@/utils/consts";
import {
  memberListId,
  memberListToggleId,
  otherMembersId,
} from "@/utils/idConsts";
import { cn } from "@/utils/shadcn/utils";
import { nextTick, ref, useId, watch } from "vue";
import * as baseStyles from "../RoomWindow.css";
import * as styles from "./RoomMemberList.css";

const roomStore = useRoomStore();
const isOpenedWindow = useIsRoomOpenedWindow();

const closeId = useId();
const isToFocusOtherMembers = ref(false);

watch(
  [() => roomStore.openedWindow, isOpenedWindow],
  ([value, isOpenedWindow], [oldValue]) => {
    if (!isOpenedWindow) {
      isToFocusOtherMembers.value = false;
      return;
    }

    if (value === "memberList") {
      isToFocusOtherMembers.value =
        document.activeElement?.id === otherMembersId;

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
      nextTick(() => {
        const elemIdToFocus = isToFocusOtherMembers.value
          ? otherMembersId
          : memberListToggleId;

        document.getElementById(elemIdToFocus)?.focus({ preventScroll: true });
      });
    }
  },
);
</script>
