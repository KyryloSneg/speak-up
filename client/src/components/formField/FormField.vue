<template>
  <VeeField v-slot="{ field, handleChange, handleBlur, errors }" :name="name">
    <UIField :data-invalid="!!errors.length">
      <UIFieldLabel :for="inputId">
        {{ label }}
      </UIFieldLabel>
      <UIInput
        autocomplete="off"
        :model-value="field.value"
        @update:model-value="handleChange"
        @blur="handleBlur"
        :name="name"
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :aria-invalid="!!errors.length"
        ref="input"
      />
      <UIFieldError
        v-if="preserveErrorSpace || errors.length"
        :errors="
          preserveErrorSpace
            ? errors.length
              ? errors
              : ['Placeholder']
            : errors
        "
        :class="cn(preserveErrorSpace && !errors.length && 'invisible')"
        :aria-hidden="
          preserveErrorSpace ? !errors.length || undefined : undefined
        "
      />
    </UIField>
  </VeeField>
</template>

<script setup lang="ts">
import {
  UIField,
  UIFieldError,
  UIFieldLabel,
} from "@/components/ui/shadcn/field";
import { UIInput } from "@/components/ui/shadcn/input";
import { cn } from "@/utils/shadcn/utils";
import { StringActions } from "@speak-up/shared";
import { Field as VeeField } from "vee-validate";
import { computed, onMounted, useId, useTemplateRef } from "vue";

const {
  name,
  label: origLabel,
  type = "text",
  autofocus = false,
  preserveErrorSpace = false,
  id,
} = defineProps<{
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  autofocus?: boolean;
  preserveErrorSpace?: boolean;
  id?: string;
}>();

const label = computed(
  () =>
    origLabel ??
    StringActions.capitalize(
      name
        .replaceAll(/[A-Z]/g, match => ` ${match}`)
        .trim()
        .toLowerCase(),
    ),
);

const inputId = computed(() => id || useId());
const inputRef = useTemplateRef("input");

onMounted(() => {
  if (autofocus) {
    const input = inputRef.value?.ref as HTMLInputElement | undefined;
    input?.focus();
  }
});
</script>
