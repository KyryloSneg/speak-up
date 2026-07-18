<template>
  <div :class="styles.windowWrapper">
    <UICard
      v-bind="baseCardProps"
      :id="roomChatId"
      :class="
        styles.card({
          visibility: activeWindow === 'chat' ? 'visible' : 'hidden',
        })
      "
    >
      <RoomChat />
    </UICard>
    <UICard
      v-bind="baseCardProps"
      :id="memberListId"
      :class="
        styles.card({
          visibility: activeWindow === 'memberList' ? 'visible' : 'hidden',
        })
      "
    >
      <RoomMemberList />
    </UICard>
  </div>
</template>

<script setup lang="ts">
import RoomChat from "@/components/roomWindow/chat/RoomChat.vue";
import RoomMemberList from "@/components/roomWindow/memberList/RoomMemberList.vue";
import { UICard } from "@/components/ui/shadcn/card";
import type { Props } from "@/components/ui/shadcn/card/UICard.vue";
import { useRoomStore } from "@/stores/room";
import { memberListId, roomChatId } from "@/utils/consts";
import { computed, ref, watch } from "vue";
import * as styles from "./RoomWindow.css";

const roomStore = useRoomStore();
const baseCardProps = computed<Props>(() => ({
  as: "aside",
  "aria-live": "polite",
}));

const activeWindow = ref(roomStore.openedWindow);

// wait until the animation is done
watch(
  () => roomStore.openedWindow,
  newWindow => {
    if (newWindow !== null) activeWindow.value = newWindow;
  },
  { immediate: true },
);
</script>
