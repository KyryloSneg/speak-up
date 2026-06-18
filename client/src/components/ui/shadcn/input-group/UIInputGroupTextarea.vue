<script setup lang="ts">
import { UITextarea } from "@/components/ui/shadcn/textarea";
import { cn } from "@/utils/shadcn/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <UITextarea
    data-slot="input-group-control"
    :class="
      cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
        props.class,
      )
    "
  />
</template>
