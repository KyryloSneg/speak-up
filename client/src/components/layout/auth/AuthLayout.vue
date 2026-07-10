<template>
  <AppHeader />
  <main>
    <!-- FormCard -->
    <slot></slot>
  </main>
</template>

<script setup lang="ts">
import AppHeader from "@/components/appHeader/AppHeader.vue";

defineSlots<{
  default: () => unknown;
}>();
</script>
