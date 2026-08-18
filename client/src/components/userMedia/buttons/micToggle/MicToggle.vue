<template>
  <BaseUserMediaButton
    @click="mediaStore.toggleMic"
    :value="mediaStore.config.audio"
    :disabled="permissionsStore.microphone === 'denied'"
    :aria-label="`Toggle microphone ${mediaStore.config.audio ? 'off' : 'on'}`"
    aria-keyshortcuts="Control+D"
  >
    <Mic v-if="mediaStore.config.audio" />
    <MicOff v-else />
  </BaseUserMediaButton>
</template>

<script setup lang="ts">
import BaseUserMediaButton from "@/components/userMedia/buttons/base/BaseUserMediaButton.vue";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { Mic, MicOff } from "@lucide/vue";
import { useEventListener } from "@vueuse/core";
import { onMounted } from "vue";

const mediaStore = useMediaStore();
const permissionsStore = usePermissionsStore();

onMounted(() => {
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (!e.ctrlKey || e.code !== "KeyD") return;

    e.preventDefault();
    mediaStore.toggleMic();
  });
});
</script>
