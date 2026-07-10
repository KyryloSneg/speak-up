<template>
  <div :class="styles.group">
    <MicToggle />
    <CameraToggle />
    <FlipCamera v-if="canFlipCamera" />
  </div>
</template>

<script setup lang="ts">
import CameraToggle from "@/components/userMedia/buttons/cameraToggle/CameraToggle.vue";
import FlipCamera from "@/components/userMedia/buttons/flipCamera/FlipCamera.vue";
import MicToggle from "@/components/userMedia/buttons/micToggle/MicToggle.vue";
import useCanFlipCamera from "@/composables/useCanFlipCamera";
import * as styles from "./UserMediaPreviewButtonGroup.css";

const canFlipCamera = useCanFlipCamera();
</script>
