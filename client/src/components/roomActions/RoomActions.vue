<template>
  <ul :class="styles.list">
    <li>
      <MicToggle />
    </li>
    <li>
      <CameraToggle />
    </li>
    <li v-if="canFlipCamera">
      <FlipCamera />
    </li>
    <li>
      <ChatToggle />
    </li>
    <li>
      <MemberListToggle />
    </li>
    <li>
      <LeaveRoom />
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
import useCanFlipCamera from "@/composables/useCanFlipCamera";
import * as styles from "./RoomActions.css";

const canFlipCamera = useCanFlipCamera();
</script>
