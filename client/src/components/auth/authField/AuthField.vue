<template>
  <VeeField v-slot="{ field, errors }" :name="name">
    <UIField :data-invalid="!!errors.length">
      <UIFieldLabel :class="styles.label" :for="name">
        {{ name }}
      </UIFieldLabel>
      <UIInput
        :id="name"
        :type="type"
        v-bind="field"
        autocomplete="off"
        :aria-invalid="!!errors.length"
        ref="input"
      />
      <UIFieldError v-if="errors.length" :errors="errors" />
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
import { Field as VeeField } from "vee-validate";
import { onMounted, useTemplateRef } from "vue";
import * as styles from "./AuthField.css";

const {
  name,
  type = "text",
  autofocus = false,
} = defineProps<{
  name: string;
  type?: string;
  autofocus?: boolean;
}>();

const inputRef = useTemplateRef("input");

onMounted(() => {
  if (autofocus) {
    const input = inputRef.value?.ref as HTMLInputElement | undefined;
    input?.focus();
  }
});
</script>
