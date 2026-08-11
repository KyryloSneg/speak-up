<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { SelectContentEmits, SelectContentProps } from "reka-ui";
import {
  SelectContent,
  SelectPortal,
  SelectViewport,
  useForwardPropsEmits,
} from "reka-ui";
import type { HTMLAttributes } from "vue";
import { UISelectScrollDownButton, UISelectScrollUpButton } from ".";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes["class"] }>(),
  {
    position: "popper",
  },
);

const emits = defineEmits<SelectContentEmits>();
const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="forwarded"
      :class="
        cn(
          'relative z-50 max-h-96 min-w-32 max-w-(--reka-select-content-available-width) overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:zoom-in-95',
          'motion-safe:data-[side=bottom]:slide-in-from-top-2 motion-safe:data-[side=left]:slide-in-from-right-2 motion-safe:data-[side=right]:slide-in-from-left-2 motion-safe:data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'motion-safe:data-[side=bottom]:translate-y-1 motion-safe:data-[side=left]:-translate-x-1 motion-safe:data-[side=right]:translate-x-1 motion-safe:data-[side=top]:-translate-y-1',
          props.class,
        )
      "
    >
      <UISelectScrollUpButton />
      <SelectViewport
        :class="
          cn(
            'p-1.5',
            position === 'popper' &&
              'h-(--reka-select-trigger-height) w-full min-w-(--reka-select-trigger-width)',
          )
        "
      >
        <slot />
      </SelectViewport>
      <UISelectScrollDownButton />
    </SelectContent>
  </SelectPortal>
</template>
