<script lang="ts" setup>
import { cn } from "@/utils/shadcn/utils";
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "reka-ui";
import { ref, useTemplateRef, type HTMLAttributes } from "vue";

export interface UIScrollbarTemplateRef {
  viewport: HTMLElement | null | undefined;
}

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const hasFocus = ref(false);
const scrollAreaRef = useTemplateRef("scrollArea");

const exposed = {
  get viewport() {
    const elem = scrollAreaRef.value;
    if (!elem) return;

    return ((elem.$el ?? elem) as HTMLElement).parentElement;
  },
} as const;

defineExpose<UIScrollbarTemplateRef>(exposed);

function focusin(e: FocusEvent): void {
  const isFocusVisible = (e.target as HTMLElement | null)?.matches(
    ":focus-visible",
  ) as boolean | undefined;

  if (typeof isFocusVisible === "boolean") {
    hasFocus.value = isFocusVisible;
  }
}

function focusout(e: FocusEvent): void {
  const relatedTarget = e.relatedTarget as HTMLElement | null;
  if (relatedTarget && exposed.viewport?.contains(relatedTarget)) return;

  hasFocus.value = false;
}
</script>

<template>
  <ScrollAreaRoot
    :type="hasFocus ? 'auto' : 'glimpse'"
    @focusin="focusin"
    @focusout="focusout"
    :class="cn('relative overflow-hidden h-full w-full', props.class)"
    v-bind="$attrs"
  >
    <ScrollAreaViewport
      class="h-full w-full rounded-[inherit] focus-visible:outline focus-visible:outline-ring focus-visible:-outline-offset-1"
      ref="scrollArea"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      force-mount
      orientation="vertical"
      class="absolute top-0 right-0 bottom-0 z-50 w-1.5 flex select-none touch-none transition-opacity duration-300 ease-out data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100"
    >
      <ScrollAreaThumb
        class="relative flex-1 rounded-full bg-primary transition-[background,opacity] hover:bg-primary/70 active:bg-primary/70"
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
