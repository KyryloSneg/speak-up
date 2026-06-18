<template>
  <h1 :class="styles.heading({ size })">
    {{ APP_NAME }}
    <MicVocalIcon :class="styles.icon({ size })" alt="" />
  </h1>
</template>

<script setup lang="ts">
import { MicVocalIcon } from "@lucide/vue";
import { APP_NAME } from "@speak-up/shared";
import * as styles from "./AppHeading.css";

const { size = "md" } = defineProps<{
  size?: styles.HeadingVariants["size"];
}>();
</script>
