<template>
  <UIButton size="icon-xl" :variant="value ? 'secondary' : 'outline'">
    <slot />
  </UIButton>
</template>

<script setup lang="ts">
import { UIButton } from "@/components/ui/shadcn/button";

defineProps<{
  value: boolean;
}>();

defineSlots<{
  default: () => unknown;
}>();
</script>
