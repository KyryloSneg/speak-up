<template>
  <UIButton :variant="value ? 'default' : 'destructive'" size="icon-xl">
    <slot />
  </UIButton>
</template>

<script setup lang="ts">
import { UIButton } from "@/components/ui/shadcn/button";

defineProps<{ value?: boolean }>();
defineSlots<{ default: () => unknown }>();
</script>
