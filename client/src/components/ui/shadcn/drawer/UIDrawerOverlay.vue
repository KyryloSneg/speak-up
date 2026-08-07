<script lang="ts" setup>
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { DialogOverlayProps } from "reka-ui";
import { DrawerOverlay } from "vaul-vue";
import { useTemplateRef, type HTMLAttributes } from "vue";

const props = defineProps<
  DialogOverlayProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");
const overlayRef = useTemplateRef("overlay");

defineExpose({
  $el: overlayRef,
});
</script>

<template>
  <DrawerOverlay
    data-slot="drawer-overlay"
    v-bind="delegatedProps"
    :class="
      cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-xs',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        props.class,
      )
    "
    ref="overlay"
  />
</template>
