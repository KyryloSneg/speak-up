<template>
  <header :class="styles.header">
    <h1 class="sr-only">{{ APP_NAME }}</h1>
    <RoomIdSpoiler />
    <AppHeaderActions />
  </header>
  <main
    :class="styles.main"
    :data-window-open="roomStore.openedWindow !== null"
    @scroll="scroll"
  >
    <RoomMemberCards />
    <RoomWindow />
  </main>
  <footer :class="styles.footer">
    <RoomActions />
  </footer>
</template>

<script setup lang="ts">
// TODO: create focus skips (through whole app) + hotkeys when the main logic will be done
import AppHeaderActions from "@/components/appHeader/actions/AppHeaderActions.vue";
import RoomActions from "@/components/roomActions/RoomActions.vue";
import RoomIdSpoiler from "@/components/roomIdSpoiler/RoomIdSpoiler.vue";
import RoomMemberCards from "@/components/roomMembers/cards/RoomMemberCards.vue";
import RoomWindow from "@/components/roomWindow/RoomWindow.vue";
import { useRoomStore } from "@/stores/room";
import { APP_NAME } from "@speak-up/shared";
import * as styles from "./RoomView.css";

const roomStore = useRoomStore();

const scroll = (e: Event) => {
  // if user tries, for example, to fill ChatInput mid-transition, browser
  // forces undesired "main" element scroll (scroll into the view of the textarea caret),
  // so prevent the scroll via this event handler
  const target = e.target as HTMLElement;

  target.scrollLeft = 0;
  target.scrollTop = 0;
};
</script>
