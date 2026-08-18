<template>
  <UIScrollbar :class="styles.root" ref="scroll">
    <ul :class="styles.list" v-if="messageStore.messageGroups?.length">
      <li
        v-for="messageGroup in messageStore.messageGroups"
        :key="messageGroup.id"
      >
        <RoomChatMessageGroup :messageGroup />
      </li>
    </ul>
    <p v-else :class="styles.noMessages">
      <Frown />
      Nobody hasn't discussed today's mood
    </p>
    <RoomChatScrollDown />
  </UIScrollbar>
</template>

<script setup lang="ts">
import RoomChatMessageGroup from "@/components/roomWindow/chat/messageList/message/RoomChatMessageGroup.vue";
import RoomChatScrollDown from "@/components/roomWindow/chat/messageList/scrollDown/RoomChatScrollDown.vue";
import UIScrollbar from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import useHandlingNewChatMessages from "@/composables/useHandlingNewChatMessages";
import { useMessageStore } from "@/stores/message";
import { Frown } from "@lucide/vue";
import * as styles from "./RoomChatMessageList.css";

const messageStore = useMessageStore();
useHandlingNewChatMessages("scroll");
</script>
