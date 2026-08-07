<template>
  <ul :class="styles.list" :style="assignInlineVars(inlineVars)">
    <li>
      <MicToggle :size="buttonSize" />
    </li>
    <li>
      <CameraToggle :size="buttonSize" />
    </li>
    <li v-if="canFlipCamera">
      <FlipCamera :size="buttonSize" />
    </li>
    <li>
      <ShareScreen :size="buttonSize" />
    </li>
    <li>
      <ChatToggle :size="buttonSize" />
    </li>
    <li>
      <MemberListToggle :size="buttonSize" />
    </li>
    <li>
      <LeaveRoom :size="buttonSize" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import ChatToggle from "@/components/roomActions/chat/ChatToggle.vue";
import LeaveRoom from "@/components/roomActions/leave/LeaveRoom.vue";
import MemberListToggle from "@/components/roomActions/memberList/MemberListToggle.vue";
import CameraToggle from "@/components/userMedia/buttons/cameraToggle/CameraToggle.vue";
import FlipCamera from "@/components/userMedia/buttons/flipCamera/FlipCamera.vue";
import MicToggle from "@/components/userMedia/buttons/micToggle/MicToggle.vue";
import ShareScreen from "@/components/userMedia/buttons/shareScreen/ShareScreen.vue";
import useCanFlipCamera from "@/composables/useCanFlipCamera";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useMediaQuery } from "@vueuse/core";
import { computed } from "vue";
import * as styles from "./RoomActions.css";

const canFlipCamera = useCanFlipCamera();
const inlineVars = computed(() => ({
  [styles.mobileGridTemplateColumns]: canFlipCamera.value
    ? "1fr 1fr 1fr 1fr"
    : "1fr 1fr 1fr",
}));

const isDesktop = useMediaQuery(
  `(min-width: ${styles.desktopRoomActionsBreakpoint})`,
);

const buttonSize = computed(() => (isDesktop.value ? "icon-xl" : "icon-lg"));
</script>
