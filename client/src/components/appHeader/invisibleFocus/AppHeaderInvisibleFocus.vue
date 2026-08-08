<template>
  <UIInvisibleFocus v-bind="focusProps">
    Skip to the main content
  </UIInvisibleFocus>
</template>

<script setup lang="ts">
import UIInvisibleFocus from "@/components/ui/custom/invisible-focus/UIInvisibleFocus.vue";
import { RouteLayoutNames } from "@/types/routes";
import type { ComponentBindings } from "@/types/vue";
import {
  authLayoutFieldGroupId,
  homeLayoutFieldGroupId,
} from "@/utils/idConsts";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const focusProps = computed<ComponentBindings<typeof UIInvisibleFocus>>(() => {
  const layout = route.meta.layout;

  if (layout === RouteLayoutNames.AUTH) {
    return { wrapperElemToFocus: authLayoutFieldGroupId };
  } else if (layout === RouteLayoutNames.HOME) {
    return { wrapperElemToFocus: homeLayoutFieldGroupId };
  }

  return {};
});
</script>
