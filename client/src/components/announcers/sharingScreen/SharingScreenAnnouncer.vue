<template>
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {{ webRTCStore.sharingScreenAnnouncerText }}
  </div>
</template>

<script setup lang="ts">
import { useWebRTCStore } from "@/stores/webrtc";

const webRTCStore = useWebRTCStore();
</script>
