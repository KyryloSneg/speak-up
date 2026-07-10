<template>
  <section :class="baseStyles.base">
    <h3 class="sr-only">Video</h3>
    <div :class="baseStyles.selectPreviewWrapper">
      <CameraSelect />
      <div :class="styles.previewBgWrapper">
        <UserMediaPreviewBg
          videoAriaLabel="Camera preview"
          :srcObject="mediaStore.userMediaStream"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import UserMediaPreviewBg from "@/components/userMedia/preview/bg/UserMediaPreviewBg.vue";
import CameraSelect from "@/components/userMedia/selects/camera/CameraSelect.vue";
import useStartingUserMedia from "@/composables/useStartingUserMedia";
import { useMediaStore } from "@/stores/media";
import * as baseStyles from "../base.css";
import * as styles from "./SettingsVideoTabContent.css";

const mediaStore = useMediaStore();
useStartingUserMedia();
</script>
