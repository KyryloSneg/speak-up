<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-md dark:shadow-[0_12px_40px_rgba(0,0,0,0.65)] dark:border-white/[0.06] dark:bg-neutral-900/50',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
