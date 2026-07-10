<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { TabsListProps } from "reka-ui";
import { TabsList } from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  TabsListProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="
      cn(
        'bg-muted text-muted-foreground inline-flex gap-1.5 h-9 w-fit items-center justify-center rounded-lg p-2',
        'data-vertical:flex-col data-vertical:h-auto data-vertical:w-48 data-vertical:items-stretch data-vertical:justify-start',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>
