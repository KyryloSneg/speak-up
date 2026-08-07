<template>
  <section data-testid="user-media-preview" :class="styles.section">
    <h3 class="sr-only">Your presence</h3>
    <div :class="styles.preview">
      <MediaBg
        videoAriaLabel="Camera preview"
        :isLocal="true"
        :videoClass="!mediaStore.config.video && 'invisible'"
      />
      <div :class="styles.overlay">
        <UserMediaPreviewHeader />
        <UserMediaPreviewCameraOff />
        <UserMediaPreviewButtonGroup />
        <UIAudioMeter
          v-if="mediaStore.config.audio"
          variant="circle-ring"
          colorVariant="contrast"
          :getAudioTrack="() => mediaStore.userAudioTrack"
          :class="cn(styles.audioMeter, 'shadow-sm')"
        />
      </div>
    </div>
    <UserMediaPreviewSelectGroup />
  </section>
</template>

<script setup lang="ts">
import UIAudioMeter from "@/components/ui/custom/audio-meter/UIAudioMeter.vue";
import MediaBg from "@/components/userMedia/bg/MediaBg.vue";
import UserMediaPreviewButtonGroup from "@/components/userMedia/preview/buttonGroup/UserMediaPreviewButtonGroup.vue";
import UserMediaPreviewCameraOff from "@/components/userMedia/preview/cameraOff/UserMediaPreviewCameraOff.vue";
import UserMediaPreviewHeader from "@/components/userMedia/preview/header/UserMediaPreviewHeader.vue";
import UserMediaPreviewSelectGroup from "@/components/userMedia/preview/selectGroup/UserMediaPreviewSelectGroup.vue";
import { useMediaStore } from "@/stores/media";
import { cn } from "@/utils/shadcn/utils";
import * as styles from "./UserMediaPreview.css";

const mediaStore = useMediaStore();
</script>
