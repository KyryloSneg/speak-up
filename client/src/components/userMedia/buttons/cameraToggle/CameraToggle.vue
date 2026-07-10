<template>
  <BaseUserMediaButton
    @click="mediaStore.toggleCamera"
    :value="mediaStore.config.video"
    :disabled="permissionsStore.camera === 'denied'"
    :aria-label="`Toggle camera ${mediaStore.config.video ? 'off' : 'on'}`"
  >
    <Camera v-if="mediaStore.config.video" />
    <CameraOff v-else />
  </BaseUserMediaButton>
</template>

<script setup lang="ts">
import BaseUserMediaButton from "@/components/userMedia/buttons/base/BaseUserMediaButton.vue";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { Camera, CameraOff } from "@lucide/vue";

const mediaStore = useMediaStore();
const permissionsStore = usePermissionsStore();
</script>
