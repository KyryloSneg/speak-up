<template>
  <AppHeader :class="styles.header" />
  <!-- AuthSection -->
  <slot></slot>
</template>

<script setup lang="ts">
import AppHeader from "@/components/appHeader/AppHeader.vue";
import * as styles from "./BaseAuthView.css";

defineSlots<{
  default: () => unknown;
}>();
</script>
