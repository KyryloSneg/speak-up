<template>
  <p v-if="!mediaStore.config.video" :class="cn(styles.message, 'select-none')">
    Camera turned off
  </p>
</template>

<script setup lang="ts">
import { useMediaStore } from "@/stores/media";
import { cn } from "@/utils/shadcn/utils";
import * as styles from "./UserMediaPreviewCameraOff.css";

const mediaStore = useMediaStore();
</script>
