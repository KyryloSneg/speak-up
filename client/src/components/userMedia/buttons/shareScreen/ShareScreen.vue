<template>
  <BaseUserMediaButton
    @click="
      mediaStore.isSharingScreen
        ? mediaStore.stopScreenSharing()
        : mediaStore.startScreenSharing()
    "
    :value="mediaStore.isSharingScreen"
    :aria-label="`${mediaStore.isSharingScreen ? 'Stop' : 'Start'} sharing screen`"
  >
    <ScreenShareOff v-if="mediaStore.isSharingScreen" />
    <ScreenShare v-else />
  </BaseUserMediaButton>
</template>

<script setup lang="ts">
import BaseUserMediaButton from "@/components/userMedia/buttons/base/BaseUserMediaButton.vue";
import { useMediaStore } from "@/stores/media";
import { ScreenShare, ScreenShareOff } from "@lucide/vue";

const mediaStore = useMediaStore();
</script>
