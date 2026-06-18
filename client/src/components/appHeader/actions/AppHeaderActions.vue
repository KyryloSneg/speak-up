<template>
  <ul :class="styles.list">
    <li>
      <ThemeToggle />
    </li>
  </ul>
</template>

<script setup lang="ts">
import ThemeToggle from "@/components/themeToggle/ThemeToggle.vue";

import * as styles from "./AppHeaderActions.css";
</script>
