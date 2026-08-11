<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import type { SelectLabelProps } from "reka-ui";
import { SelectLabel } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  SelectLabelProps & { class?: HTMLAttributes["class"] }
>();
</script>

<template>
  <SelectLabel
    :class="
      cn(
        'py-1.5 pl-9 pr-2 text-xs font-semibold tracking-wide text-muted-foreground',
        props.class,
      )
    "
  >
    <slot />
  </SelectLabel>
</template>
