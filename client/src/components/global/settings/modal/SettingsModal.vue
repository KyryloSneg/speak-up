<template>
  <component :is="ResponsiveModal.Root">
    <component :is="ResponsiveModal.Trigger" as-child>
      <SettingsButton v-bind="triggerProps" />
    </component>
    <component :is="ResponsiveModal.ScrollContent" :class="styles.content">
      <component :is="ResponsiveModal.Header" :class="styles.header">
        <component :is="ResponsiveModal.Title" :class="styles.title">
          Settings
        </component>
        <component :is="ResponsiveModal.Description" class="sr-only">
          Adjust everything as needed
        </component>
      </component>
      <SettingsModalTabs :orientation="isDesktop ? 'vertical' : 'horizontal'" />
    </component>
  </component>
</template>

<script setup lang="ts">
import SettingsButton from "@/components/global/settings/button/SettingsButton.vue";
import SettingsModalTabs from "@/components/global/settings/modal/tabs/SettingsModalTabs.vue";
import type { UIButtonProps } from "@/components/ui/shadcn/button";
import useResponsiveModal from "@/composables/useResponsiveModal";
import { useMediaQuery } from "@vueuse/core";
import * as styles from "./SettingsModal.css";

defineProps<{
  triggerProps?: UIButtonProps;
}>();

const breakpoint = "40rem";
const ResponsiveModal = useResponsiveModal(breakpoint);

const isDesktop = useMediaQuery(`(min-width: ${breakpoint})`);
</script>
