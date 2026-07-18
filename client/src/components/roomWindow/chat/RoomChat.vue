<template>
  <UICardHeader :class="baseStyles.header">
    <UICardTitle as="h2">Chat</UICardTitle>
    <UICardAction>
      <BaseCloseRoomWindowButton
        aria-label="Close chat"
        :aria-controls="roomChatId"
      />
    </UICardAction>
  </UICardHeader>
  <UICardContent :class="baseStyles.content">
    <RoomChatMessageList />
  </UICardContent>
  <UICardFooter>
    <ChatInput />
  </UICardFooter>
</template>

<script setup lang="ts">
import BaseCloseRoomWindowButton from "@/components/roomWindow/base/close/BaseCloseRoomWindowButton.vue";
import ChatInput from "@/components/roomWindow/chat/input/ChatInput.vue";
import RoomChatMessageList from "@/components/roomWindow/chat/messageList/RoomChatMessageList.vue";
import {
  UICardAction,
  UICardContent,
  UICardFooter,
  UICardHeader,
  UICardTitle,
} from "@/components/ui/shadcn/card";
import { useRoomStore } from "@/stores/room";
import { roomChatId, roomChatInputId, roomChatToggleId } from "@/utils/consts";
import { nextTick, watch } from "vue";
import * as baseStyles from "../RoomWindow.css";

const roomStore = useRoomStore();

watch(
  () => roomStore.openedWindow,
  (value, oldValue) => {
    if (value === "chat") {
      nextTick(() =>
        document
          .getElementById(roomChatInputId)
          ?.focus({ preventScroll: true }),
      );
    } else if (value === null && oldValue === "chat") {
      nextTick(() =>
        document
          .getElementById(roomChatToggleId)
          ?.focus({ preventScroll: true }),
      );
    }
  },
);
</script>
