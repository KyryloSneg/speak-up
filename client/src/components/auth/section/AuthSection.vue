<template>
  <UICard :class="styles.section">
    <UICardHeader :class="styles.header">
      <UICardTitle :class="styles.title">
        {{ heading }}
      </UICardTitle>
      <UICardAction :class="styles.action">
        <UIButton
          variant="link"
          :class="styles.link"
          :as="RouterLink"
          :to="goToOtherAuthMethodLink.to"
        >
          {{ goToOtherAuthMethodLink.text }}
        </UIButton>
      </UICardAction>
    </UICardHeader>
    <UICardContent>
      <form @submit.prevent="submitButton.submit" :id="formId">
        <slot></slot>
      </form>
    </UICardContent>
    <UICardFooter>
      <UIButton
        size="lg"
        type="submit"
        :class="styles.submit"
        :form="formId"
        :disabled="disabled || isSubmitting"
      >
        {{ submitButton.text }}
      </UIButton>
    </UICardFooter>
  </UICard>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import {
  UICard,
  UICardAction,
  UICardContent,
  UICardFooter,
  UICardHeader,
  UICardTitle,
} from "@/components/ui/shadcn/card/index";
import { useId } from "vue";
import { RouterLink } from "vue-router";
import * as styles from "./AuthSection.css";

const formId = useId();

defineProps<{
  heading: string;
  goToOtherAuthMethodLink: {
    text: string;
    to: string;
  };
  submitButton: {
    text: string;
    submit: (event?: Event) => void;
  };
  isSubmitting: boolean;
  disabled: boolean;
}>();

defineSlots<{
  default(): unknown;
}>();
</script>
