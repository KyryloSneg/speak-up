<template>
  <section :class="baseStyles.base">
    <h3 class="sr-only">Video</h3>
    <div :class="baseStyles.selectPreviewWrapper">
      <CameraSelect />
      <div :class="styles.previewBgWrapper">
        <MediaBg
          videoAriaLabel="Camera preview"
          :isLocal="true"
          :srcObject="streamData.stream.value"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import MediaBg from "@/components/userMedia/bg/MediaBg.vue";
import CameraSelect from "@/components/userMedia/selects/camera/CameraSelect.vue";
import useSingleUserMediaStream from "@/composables/useSingleUserMediaStream";
import * as baseStyles from "../base.css";
import * as styles from "./SettingsVideoTabContent.css";

const streamData = useSingleUserMediaStream("video");
</script>
