<script setup lang="ts">
import type { ComponentAs } from "@/types/props";
import { cn } from "@/utils/shadcn/utils";
import { useTemplateRef, type HTMLAttributes } from "vue";

export interface Props {
  class?: HTMLAttributes["class"];
  as?: ComponentAs;
}

const props = withDefaults(defineProps<Props>(), { as: "div" });
const cardRef = useTemplateRef("card");

defineExpose({
  $el: cardRef,
});
</script>

<template>
  <component
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground border-border flex flex-col gap-6 rounded-xl border py-6 shadow-md',
        props.class,
      )
    "
    :is="props.as"
    ref="card"
  >
    <slot />
  </component>
</template>
