<script setup lang="ts">
import { UIButton } from "@/components/ui/shadcn/button";
import { cn } from "@/utils/shadcn/utils";
import { DialogClose } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    showCloseButton?: boolean;
  }>(),
  {
    showCloseButton: false,
  },
);
</script>

<template>
  <div
    data-slot="dialog-footer"
    :class="
      cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', props.class)
    "
  >
    <slot />
    <DialogClose v-if="showCloseButton" as-child>
      <UIButton variant="outline"> Close </UIButton>
    </DialogClose>
  </div>
</template>
