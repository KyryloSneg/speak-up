<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <kbd
    :class="
      cn(
        'pointer-events-none inline-flex h-6 min-w-6 select-none items-center justify-center gap-1 rounded-md border border-border/80 bg-muted px-2 font-mono text-xs font-medium text-muted-foreground shadow-xs opacity-100',
        '[&_svg:not([class*=\'size-\'])]:size-3.5',
        '[data-slot=tooltip-content]_&:h-5 [data-slot=tooltip-content]_&:min-w-5 [data-slot=tooltip-content]_&:px-1.5 [data-slot=tooltip-content]_&:text-[10px] [data-slot=tooltip-content]_&:border-transparent [data-slot=tooltip-content]_&:bg-popover-foreground/15 [data-slot=tooltip-content]_&:text-popover-foreground',
        props.class,
      )
    "
  >
    <slot />
  </kbd>
</template>
