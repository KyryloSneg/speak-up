<template>
  <section :class="baseStyles.base">
    <h3 class="sr-only">Audio</h3>
    <div :class="baseStyles.selectPreviewWrapper">
      <MicSelect />
      <UIAudioMeter
        variant="bar"
        :getAudioTrack="() => mediaStore.userAudioTrack"
        :aria-disabled="isAudioMeterDisabled"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import UIAudioMeter from "@/components/ui/custom/audio-meter/UIAudioMeter.vue";
import MicSelect from "@/components/userMedia/selects/microphone/MicSelect.vue";
import useStartingUserMedia from "@/composables/useStartingUserMedia";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { computed } from "vue";
import * as baseStyles from "../base.css";

const mediaStore = useMediaStore();
const permissionsStore = usePermissionsStore();

const isAudioMeterDisabled = computed(
  () => permissionsStore.microphone !== "granted",
);

useStartingUserMedia();
</script>
