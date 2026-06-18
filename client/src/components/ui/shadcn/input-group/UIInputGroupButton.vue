<script setup lang="ts">
import type { ButtonVariants } from "@/components/ui/shadcn/button";
import { UIButton } from "@/components/ui/shadcn/button";
import { cn } from "@/utils/shadcn/utils";
import type { HTMLAttributes } from "vue";
import type { InputGroupButtonVariants } from ".";
import { inputGroupButtonVariants } from ".";

interface InputGroupButtonProps {
  variant?: ButtonVariants["variant"];
  size?: InputGroupButtonVariants["size"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<InputGroupButtonProps>(), {
  size: "xs",
  variant: "ghost",
});
</script>

<template>
  <UIButton
    :data-size="props.size"
    :variant="props.variant"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </UIButton>
</template>
