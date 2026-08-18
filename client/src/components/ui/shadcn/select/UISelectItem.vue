<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { CheckIcon } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import type { SelectItemProps } from "reka-ui";
import {
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  useForwardProps,
} from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  SelectItemProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectItem
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-default select-none items-center rounded-lg min-w-0 py-2 pl-9 pr-3 text-sm font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-popover-foreground focus:bg-accent focus:text-accent-foreground',
        props.class,
      )
    "
  >
    <span class="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <CheckIcon class="size-4 stroke-[2.5]" />
      </SelectItemIndicator>
    </span>

    <SelectItemText class="block truncate w-full">
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
