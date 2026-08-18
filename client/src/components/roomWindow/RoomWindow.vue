<template>
  <div
    v-show="isOpenedWindow"
    :class="styles.windowWrapper"
    data-room-window="true"
  >
    <UIInvisibleFocus
      v-if="isOpenedWindow && !!roomStore.openedWindow"
      selector="footer"
      class="top-6 left-6"
    >
      Go back to the actions
    </UIInvisibleFocus>
    <UICard
      v-bind="baseCardProps"
      :id="roomChatId"
      :class="
        styles.card({
          visibility: activeWindow === 'chat' ? 'visible' : 'hidden',
        })
      "
      ref="chat"
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
      ref="memberList"
    >
      <RoomMemberList />
    </UICard>
    <UIInvisibleFocus
      v-if="isOpenedWindow && !!roomStore.openedWindow"
      :wrapperElemToFocus="
        roomStore.openedWindow === 'chat' ? roomChatElemRef : memberListElemRef
      "
      selector='[data-room-window="true"] [data-reka-scroll-area-viewport]'
      class="bottom-9 left-1/2 -translate-x-1/2"
    >
      Go to the start of the
      {{ roomStore.openedWindow === "chat" ? "chat" : "member list" }}
    </UIInvisibleFocus>
  </div>
</template>

<script setup lang="ts">
import RoomChat from "@/components/roomWindow/chat/RoomChat.vue";
import RoomMemberList from "@/components/roomWindow/memberList/RoomMemberList.vue";
import UIInvisibleFocus from "@/components/ui/custom/invisible-focus/UIInvisibleFocus.vue";
import { UICard } from "@/components/ui/shadcn/card";
import type { Props } from "@/components/ui/shadcn/card/UICard.vue";
import useControllingFocus from "@/composables/useControllingFocus";
import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { useRoomStore } from "@/stores/room";
import { memberListId, roomChatId } from "@/utils/idConsts";
import { computed, ref, useTemplateRef, watch } from "vue";
import * as styles from "./RoomWindow.css";

const roomStore = useRoomStore();
const isOpenedWindow = useIsRoomOpenedWindow();

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

const roomChatRef = useTemplateRef("chat");
const memberListRef = useTemplateRef("memberList");

const roomChatElemRef = computed(() => roomChatRef.value?.$el || null);
const memberListElemRef = computed(() => memberListRef.value?.$el || null);

useControllingFocus(() => roomStore.openedWindow !== "chat", roomChatElemRef);
useControllingFocus(
  () => roomStore.openedWindow !== "memberList",
  memberListElemRef,
);
</script>
