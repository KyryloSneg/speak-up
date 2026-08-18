<template>
  <UIButton
    :class="cn(styles.button, 'transition-none not-focus-visible:sr-only')"
    data-invisible-focus="true"
    :data-is-autofocusable="isAutoFocusable"
    @click="click"
  >
    <slot />
  </UIButton>
</template>

<script setup lang="ts">
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { FOCUSABLE_SELECTOR } from "@/utils/consts";
import { cn } from "@/utils/shadcn/utils";
import * as styles from "./UIInvisibleFocus.css";

const props = defineProps<{
  elemToFocus?: string | HTMLElement | null;
  wrapperElemToFocus?: string | HTMLElement | null;
  selector?: string;
  isAutoFocusable?: boolean;
}>();

function click(): void {
  type OptionalElement = HTMLElement | null | undefined;

  function getElem(origElem: string | OptionalElement): OptionalElement {
    let elem: OptionalElement;

    if (typeof origElem === "string") {
      elem = document.getElementById(origElem);
    } else if (origElem instanceof HTMLElement) {
      elem = origElem;
    }

    return elem;
  }

  function getFirstFocusableElem(elem: OptionalElement): OptionalElement {
    const focusableElements = elem?.querySelectorAll(FOCUSABLE_SELECTOR);
    if (!focusableElements) return;

    const focusableElementsArray = Array.from(
      focusableElements,
    ) as HTMLElement[];

    return focusableElementsArray.find(
      elem =>
        elem.dataset.isAutofocusable === "true" ||
        elem.dataset.invisibleFocus !== "true",
    );
  }

  let elem: OptionalElement;
  const certainElemToFocus = getElem(props.elemToFocus);

  if (certainElemToFocus) {
    elem = certainElemToFocus;
  } else {
    const wrapperElem = getElem(props.wrapperElemToFocus);
    elem = props.selector ? wrapperElem : getFirstFocusableElem(wrapperElem);
  }

  if (props.selector) {
    let focusableElem: OptionalElement;

    if (elem?.matches(FOCUSABLE_SELECTOR)) {
      focusableElem = elem;
    } else {
      const selectedElem = (elem || document).querySelector(
        props.selector,
      ) as OptionalElement;

      if (selectedElem?.matches(FOCUSABLE_SELECTOR)) {
        focusableElem = selectedElem;
      } else {
        const firstFocusableElem = getFirstFocusableElem(selectedElem);
        focusableElem = firstFocusableElem;
      }
    }

    focusableElem?.focus();
  } else {
    elem?.focus();
  }
}
</script>
