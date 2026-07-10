<template>
  <div
    role="meter"
    :aria-valuenow="volume"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Microphone input level"
    :class="styles.root(styleVariants)"
    :style="assignInlineVars(inlineVars)"
  >
    <div v-if="variant === 'bar'" :class="styles.barContainer(styleVariants)">
      <div
        v-for="i in maxSegments"
        :key="i"
        :class="
          cn(
            styles.barSegment(styleVariants),
            volume >= (i / maxSegments) * 100 && styles.barSegmentActive,
          )
        "
      ></div>
    </div>

    <div
      v-else-if="variant === 'circle-ring'"
      :class="styles.circleRingContainer"
    >
      <svg :class="styles.circleRingSvg" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          :class="styles.circleRingTrack(styleVariants)"
          stroke-width="3"
        />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          :class="styles.circleRingIndicator"
          stroke-width="3"
          :stroke-dasharray="ringIndicatorDashArray"
          :stroke-dashoffset="ringIndicatoDashOffset"
          stroke-linecap="round"
        />
      </svg>
      <div
        :class="
          cn(
            styles.circleRingCenter(styleVariants),
            isRingActivated && styles.circleRingCenterActive,
          )
        "
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useAudioMeter from "@/composables/useAudioMeter";
import { globalThemeContract } from "@/styles/theme.css";
import { cn } from "@/utils/shadcn/utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { computed } from "vue";
import * as styles from "./UIAudioMeter.css";

const {
  getAudioTrack,
  variant = "bar",
  maxSegments = 14,
  colorVariant = "default",
} = defineProps<{
  getAudioTrack: () => MediaStreamTrack | null | undefined;
  variant?: "bar" | "circle-ring";
  maxSegments?: number;
  colorVariant?: styles.RootVariants["color"];
}>();

const { volume } = useAudioMeter(getAudioTrack);
const currentThemeColor = computed(() => {
  if (volume.value >= 90) return globalThemeContract.backgroundColor.danger;
  if (volume.value >= 70) {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";

    return isDark ? "#fdd663" : "#f9ab00";
  }

  return globalThemeContract.outline.activeSpeaker;
});

const inlineVars = computed(() => ({
  [styles.volumeColor]: currentThemeColor.value,
}));

const styleVariants = computed<styles.RootVariants>(() => ({
  color: colorVariant,
}));

const isRingActivated = computed(() => volume.value > 5);

const ringIndicatorDashArray = 88;
const ringIndicatoDashOffset = computed(() => {
  if (!isRingActivated.value) return ringIndicatorDashArray;
  const value =
    ringIndicatorDashArray - (ringIndicatorDashArray * volume.value) / 100;

  return value;
});
</script>
