<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { DialogDescriptionProps } from "reka-ui";
import { DialogDescription, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  DialogDescriptionProps & { class?: HTMLAttributes["class"] }
>();
const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="forwardedProps"
    :class="cn('text-secondaryforeground text-md', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
