<script setup lang="ts">
import { cn } from "@/utils/shadcn/utils";
import { reactiveOmit } from "@vueuse/core";
import type { SliderRootEmits, SliderRootProps } from "reka-ui";
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  useForwardPropsEmits,
} from "reka-ui";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  SliderRootProps & { class?: HTMLAttributes["class"] }
>();

const emits = defineEmits<SliderRootEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SliderRoot
    v-slot="{ modelValue }"
    data-slot="slider"
    :class="
      cn(
        'relative flex w-full touch-none select-none items-center data-disabled:pointer-events-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-44 data-vertical:w-auto data-vertical:flex-col',
        props.class,
      )
    "
    v-bind="forwarded"
  >
    <SliderTrack
      data-slot="slider-track"
      class="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-vertical:h-full data-vertical:w-1.5"
    >
      <SliderRange
        data-slot="slider-range"
        class="absolute bg-primary data-[orientation=horizontal]:h-full data-vertical:w-full"
      />
    </SliderTrack>

    <SliderThumb
      v-for="(_, key) in modelValue"
      :key="key"
      data-slot="slider-thumb"
      class="block size-4 shrink-0 cursor-pointer rounded-full border-2 border-primary! bg-background shadow-sm outline-none transition-shadow duration-150 hover:ring-4 hover:ring-primary/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-4 focus-visible:ring-accent/25 disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
