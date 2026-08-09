<template>
  <section :class="styles.section">
    <h4 :class="baseStyles.heading">App theme</h4>
    <ThemeToggle />
  </section>
</template>

<script setup lang="ts">
import ThemeToggle from "@/components/themeToggle/ThemeToggle.vue";
import * as baseStyles from "../SettingsGeneralTabContent.css";
import * as styles from "./SettingsGeneralTabTheme.css";
</script>
