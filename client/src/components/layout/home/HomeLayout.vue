<template>
  <AppHeader />
  <main :class="styles.main">
    <div :class="styles.headingDetailsWrapper">
      <h2 :class="styles.heading">
        Conferences and videomeetups for
        <strong :class="styles.headingSpan">everyone</strong>
      </h2>
      <p :class="styles.details">
        {{
          `${APP_NAME} provides you and your colleagues with flawless connection`
        }}
      </p>
    </div>
    <div :class="styles.previewFormWrapper">
      <UserMediaPreview />
      <!-- FormCard -->
      <slot></slot>
    </div>
  </main>
</template>

<script setup lang="ts">
import AppHeader from "@/components/appHeader/AppHeader.vue";
import UserMediaPreview from "@/components/userMedia/preview/UserMediaPreview.vue";
import { APP_NAME } from "@speak-up/shared";
import * as styles from "./HomeLayout.css";

defineSlots<{
  default: () => unknown;
}>();
</script>
