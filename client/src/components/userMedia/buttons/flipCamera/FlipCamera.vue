<template>
  <BaseUserMediaButton
    @click="mediaStore.flipCamera"
    :value="mediaStore.isCameraFlipped"
    :disabled="!mediaStore.config.video"
    aria-label="Flip camera"
  >
    <SwitchCamera />
  </BaseUserMediaButton>
</template>

<script setup lang="ts">
import BaseUserMediaButton from "@/components/userMedia/buttons/base/BaseUserMediaButton.vue";
import { useMediaStore } from "@/stores/media";
import { SwitchCamera } from "@lucide/vue";

const mediaStore = useMediaStore();
</script>
