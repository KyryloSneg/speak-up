<template>
  <UIButton aria-label="Open settings" size="icon" variant="outline">
    <Settings />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { Settings } from "@lucide/vue";
</script>
