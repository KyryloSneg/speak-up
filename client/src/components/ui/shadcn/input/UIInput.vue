<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { useVModel } from "@vueuse/core";
import type { HTMLAttributes } from "vue";
import { useTemplateRef } from "vue";

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes["class"];
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const ref = useTemplateRef("input");
defineExpose({ ref });
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'h-9 w-full min-w-0 rounded-md border border-input px-3 py-1 text-base shadow-xs outline-none md:text-sm',
        'bg-muted/30 dark:bg-muted/15 text-foreground placeholder:text-muted-foreground/60',
        'selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'transition-all duration-150',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/30 aria-invalid:focus-visible:border-destructive',
        props.class,
      )
    "
    ref="input"
  />
</template>
