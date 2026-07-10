<script setup lang="ts" generic="T extends import('@/types/props').ComponentAs">
import type { ComponentAs } from "@/types/props";
import { cn } from "@/utils/shadcn/utils";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  as?: ComponentAs;
}>();

const isValue = computed(() => props.as || "h2");
</script>

<template>
  <component
    data-slot="card-title"
    :is="isValue"
    :class="cn('leading-none font-semibold', props.class)"
  >
    <slot />
  </component>
</template>
