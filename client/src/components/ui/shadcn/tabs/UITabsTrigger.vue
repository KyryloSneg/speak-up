<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { TabsTriggerProps } from "reka-ui";
import { TabsTrigger, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TabsTrigger
    data-slot="tabs-trigger"
    v-bind="forwardedProps"
    :class="
      cn(
        'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-md font-medium whitespace-nowrap transition-all',
        'disabled:pointer-events-none disabled:opacity-40',
        'text-muted-foreground hover:text-foreground',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs',
        'border border-transparent data-[state=active]:border-border',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
        'data-vertical:justify-start data-vertical:w-full data-vertical:px-4 data-vertical:py-2',
        props.class,
      )
    "
  >
    <slot />
  </TabsTrigger>
</template>
