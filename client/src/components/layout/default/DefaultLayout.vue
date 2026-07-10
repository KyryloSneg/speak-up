<template>
  <slot></slot>
</template>

<script setup lang="ts">
defineSlots<{
  default: () => unknown;
}>();
</script>
