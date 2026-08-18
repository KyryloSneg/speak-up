<template>
  <BaseUserMediaButton
    @click="cb"
    :value="mediaStore.isSharingScreen"
    :aria-label="`${mediaStore.isSharingScreen ? 'Stop' : 'Start'} sharing screen`"
    aria-keyshortcuts="Control+Alt+T Control+Meta+T"
  >
    <ScreenShareOff v-if="mediaStore.isSharingScreen" />
    <ScreenShare v-else />
  </BaseUserMediaButton>
</template>

<script setup lang="ts">
import BaseUserMediaButton from "@/components/userMedia/buttons/base/BaseUserMediaButton.vue";
import { useMediaStore } from "@/stores/media";
import { ScreenShare, ScreenShareOff } from "@lucide/vue";
import { useEventListener } from "@vueuse/core";
import { onMounted } from "vue";

function cb(): void {
  if (mediaStore.isSharingScreen) {
    mediaStore.stopScreenSharing();
  } else {
    mediaStore.startScreenSharing();
  }
}

const mediaStore = useMediaStore();

onMounted(() => {
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (!e.altKey && !e.metaKey) return;
    if (!e.ctrlKey || e.code !== "KeyT") return;

    e.preventDefault();
    cb();
  });
});
</script>
