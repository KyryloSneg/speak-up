<template>
  <div :class="cn(styles.bgWrapper, 'shadow-lg')">
    <video
      autoplay
      playsinline
      muted
      :aria-label="videoAriaLabel"
      :class="
        cn(styles.bg({ origin: isLocal ? 'local' : 'remote' }), videoClass)
      "
      ref="video"
    />
  </div>
</template>

<script setup lang="ts">
// TODO: make this component a generic one later (useful for the other users camera too)
import useStartingUserMedia from "@/composables/useStartingUserMedia";
import { useMediaStore } from "@/stores/media";
import { cn } from "@/utils/shadcn/utils";
import { useTemplateRef, watchPostEffect, type HTMLAttributes } from "vue";
import * as styles from "./UserMediaPreviewBg.css";

const props = defineProps<{
  isLocal?: boolean;
  srcObject?: MediaStream | null;
  videoClass?: HTMLAttributes["class"];
  videoAriaLabel?: HTMLAttributes["aria-label"];
}>();

const mediaStore = useMediaStore();
const videoRef = useTemplateRef("video");

useStartingUserMedia();

watchPostEffect(() => {
  const videoElem = videoRef.value as HTMLVideoElement | undefined;
  if (!videoElem) return;

  videoElem.srcObject = props.srcObject || mediaStore.userMediaStream;
});
</script>
