<script lang="ts" setup>
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import { useForwardPropsEmits } from "reka-ui";
import { DrawerContent, DrawerPortal } from "vaul-vue";
import type { HTMLAttributes } from "vue";
import UIDrawerOverlay from "./UIDrawerOverlay.vue";

defineOptions({
  inheritAttrs: false,
});

const emits = defineEmits<DialogContentEmits>();
const props = defineProps<
  DialogContentProps & {
    class?: HTMLAttributes["class"];
    rootClass?: HTMLAttributes["class"];
  }
>();

const delegatedProps = reactiveOmit(props, "class", "rootClass");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DrawerPortal>
    <UIDrawerOverlay />
    <DrawerContent
      data-slot="drawer-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'group/drawer-content bg-background text-foreground border-border fixed z-50 flex flex-col',
          'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[85vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
          'data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[85vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t',
          'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:sm:max-w-sm data-[vaul-drawer-direction=right]:border-l',
          'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=left]:border-r',
          props.rootClass,
        )
      "
    >
      <div
        class="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
      />
      <div :class="cn('flex-1 overflow-y-auto p-6 space-y-4', props.class)">
        <slot />
      </div>
    </DrawerContent>
  </DrawerPortal>
</template>
