<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { PopoverContentEmits, PopoverContentProps } from "reka-ui";
import { PopoverContent, PopoverPortal, useForwardPropsEmits } from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    PopoverContentProps & {
      class?: HTMLAttributes["class"];
    }
  >(),
  {
    align: "center",
    sideOffset: 4,
  },
);

const emits = defineEmits<PopoverContentEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      data-slot="popover-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'z-50 w-60 max-w-(--reka-popover-content-available-width) origin-(--reka-popover-content-transform-origin) rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:zoom-in-95',
          'motion-safe:data-[side=bottom]:slide-in-from-top-2 motion-safe:data-[side=left]:slide-in-from-right-2 motion-safe:data-[side=right]:slide-in-from-left-2 motion-safe:data-[side=top]:slide-in-from-bottom-2',
          props.class,
        )
      "
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
