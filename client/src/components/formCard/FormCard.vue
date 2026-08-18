<template>
  <UICard :class="styles.section({ width })">
    <UICardHeader :class="headerClass">
      <UICardTitle :class="titleClass" :as="titleAs">
        {{ heading }}
      </UICardTitle>
      <UIInvisibleFocus v-if="invisibleFocus" v-bind="invisibleFocus.props">
        {{ invisibleFocus.text }}
      </UIInvisibleFocus>
      <UICardAction v-if="link" :class="actionClass">
        <UIButton
          :variant="link.variant || 'link'"
          :class="styles.link"
          :as="RouterLink"
          :to="link.to"
        >
          {{ link.text }}
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
import UIInvisibleFocus from "@/components/ui/custom/invisible-focus/UIInvisibleFocus.vue";
import type { ButtonVariants } from "@/components/ui/shadcn/button";
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import {
  UICard,
  UICardAction,
  UICardContent,
  UICardFooter,
  UICardHeader,
  UICardTitle,
} from "@/components/ui/shadcn/card/index";
import type { ComponentAs } from "@/types/props";
import type { ComponentBindings } from "@/types/vue";
import { useId, type HTMLAttributes } from "vue";
import { RouterLink } from "vue-router";
import * as styles from "./FormCard.css";

const formId = useId();

const { width = "adaptive" } = defineProps<{
  width?: styles.SectionVariants["width"];
  headerClass?: HTMLAttributes["class"];
  titleClass?: HTMLAttributes["class"];
  actionClass?: HTMLAttributes["class"];
  titleAs?: ComponentAs;
  heading: string;
  link?: {
    text: string;
    to: string;
    variant?: ButtonVariants["variant"];
  };
  invisibleFocus?: {
    text: string;
    props: ComponentBindings<typeof UIInvisibleFocus>;
  };
  submitButton: {
    text: string;
    submit: (event?: Event) => void;
  };
  isSubmitting?: boolean;
  disabled?: boolean;
}>();

defineSlots<{
  default(): unknown;
}>();
</script>
