<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { ChevronDownIcon } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import type { SelectTriggerProps } from "reka-ui";
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<
    SelectTriggerProps & {
      class?: HTMLAttributes["class"];
      size?: "sm" | "default";
    }
  >(),
  { size: "default" },
);

const delegatedProps = reactiveOmit(props, "class", "size");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'flex h-10 w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-medium transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ' +
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
          'border-neutral-200/80 bg-white text-neutral-900 ' +
          'dark:border-white/[0.08] dark:bg-neutral-900 dark:text-neutral-50',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDownIcon class="size-4 opacity-50 shrink-0" />
    </SelectIcon>
  </SelectTrigger>
</template>
