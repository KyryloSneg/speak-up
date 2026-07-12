<template>
  <header :class="styles.header">
    <h1 class="sr-only">{{ APP_NAME }}</h1>
    <RoomIdSpoiler />
    <AppHeaderActions />
  </header>
  <main :class="styles.main">
    <RoomMemberCards />
    <RoomChat />
    <RoomMemberList />
  </main>
  <footer :class="styles.footer">
    <RoomActions />
  </footer>
</template>

<script setup lang="ts">
import AppHeaderActions from "@/components/appHeader/actions/AppHeaderActions.vue";
import RoomChat from "@/components/chat/RoomChat.vue";
import RoomActions from "@/components/roomActions/RoomActions.vue";
import RoomIdSpoiler from "@/components/roomIdSpoiler/RoomIdSpoiler.vue";
import RoomMemberCards from "@/components/roomMembers/cards/RoomMemberCards.vue";
import RoomMemberList from "@/components/roomMembers/list/RoomMemberList.vue";
import { APP_NAME } from "@speak-up/shared";
import * as styles from "./RoomView.css";
</script>
