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
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ' +
            'max-w-[var(--reka-select-content-available-width)] ' +
            'border-neutral-200/80 bg-white text-neutral-900 shadow-[0_15px_45px_rgba(0,0,0,0.14)] ' +
            'dark:border-white/[0.08] dark:bg-neutral-900 dark:text-neutral-50 dark:shadow-[0_22px_60px_rgba(0,0,0,0.7)]',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
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
              'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]',
          )
        "
      >
        <slot />
      </SelectViewport>
      <UISelectScrollDownButton />
    </SelectContent>
  </SelectPortal>
</template>
