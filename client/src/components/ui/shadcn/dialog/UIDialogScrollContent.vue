<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { X } from "@lucide/vue";
import { reactiveOmit } from "@vueuse/core";
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui";
import type { HTMLAttributes } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  DialogContentProps & { class?: HTMLAttributes["class"] }
>();

const emits = defineEmits<DialogContentEmits>();
const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <DialogContent
        :class="
          cn(
            'bg-background text-foreground border-border relative z-50 grid w-full max-w-lg my-8 gap-4 border p-6 shadow-lg duration-200 max-sm:border-x-0 sm:rounded-lg md:w-full',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            props.class,
          )
        "
        v-bind="{ ...$attrs, ...forwarded }"
        @pointer-down-outside="
          event => {
            const originalEvent = event.detail.originalEvent;
            const target = originalEvent.target as HTMLElement;
            if (
              originalEvent.offsetX > target.clientWidth ||
              originalEvent.offsetY > target.clientHeight
            ) {
              event.preventDefault();
            }
          }
        "
      >
        <slot />

        <DialogClose
          :class="
            cn(
              'text-muted-foreground absolute top-4 right-4 p-1.5 transition-all rounded-md hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden',
            )
          "
        >
          <X class="w-4 h-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>
