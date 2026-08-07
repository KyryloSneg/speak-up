<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { TooltipContentEmits, TooltipContentProps } from "reka-ui";
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  useForwardPropsEmits,
} from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    TooltipContentProps & {
      class?: HTMLAttributes["class"];
      hideArrow?: boolean;
    }
  >(),
  {
    sideOffset: 6,
  },
);

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = reactiveOmit(props, "class", "hideArrow");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      data-slot="tooltip-content"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="
        cn(
          'z-50 w-fit origin-(--reka-tooltip-content-transform-origin) rounded-lg bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-md text-balance outline-none select-none',
          'animate-in fade-in-0 zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-1.5 data-[side=left]:slide-in-from-right-1.5 data-[side=right]:slide-in-from-left-1.5 data-[side=top]:slide-in-from-bottom-1.5',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          props.class,
        )
      "
    >
      <slot />
      <TooltipArrow
        v-if="!hideArrow"
        :width="10"
        :height="5"
        class="fill-popover z-50"
      />
    </TooltipContent>
  </TooltipPortal>
</template>
