<template>
  <div :class="styles.group">
    <MicSelect />
    <CameraSelect />
  </div>
</template>

<script setup lang="ts">
import CameraSelect from "@/components/userMedia/selects/camera/CameraSelect.vue";
import MicSelect from "@/components/userMedia/selects/microphone/MicSelect.vue";
import * as styles from "./UserMediaPreviewSelectGroup.css";
</script>
