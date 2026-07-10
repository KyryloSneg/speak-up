<template>
  <BaseUserMediaSelect
    label="Camera"
    triggerAriaLabel="Select a camera"
    :value="mediaSettingsStore.selectedCamera"
    :select
    :devices="mediaStore.cameras"
  />
</template>

<script setup lang="ts">
import BaseUserMediaSelect from "@/components/userMedia/selects/base/BaseUserMediaSelect.vue";
import { useMediaStore } from "@/stores/media";
import { useMediaSettingsStore } from "@/stores/mediaSettings";
import type { AcceptableValue } from "reka-ui";

const mediaStore = useMediaStore();
const mediaSettingsStore = useMediaSettingsStore();

function select(value: AcceptableValue): void {
  if (!value) return;
  mediaSettingsStore.selectedCamera = value as string;
}
</script>
