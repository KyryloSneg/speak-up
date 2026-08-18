<template>
  <component :is="ResponsiveModal.Root">
    <component :is="ResponsiveModal.Trigger" as-child>
      <SettingsButton
        data-settings-button="true"
        :aria-keyshortcuts="isHotkey ? 'Control+Shift+,' : undefined"
        v-bind="triggerProps"
        ref="trigger"
      />
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
import { responsiveModalBreakpoint } from "@/utils/breakpointConsts";
import { useEventListener, useMediaQuery } from "@vueuse/core";
import { onMounted, useTemplateRef } from "vue";
import * as styles from "./SettingsModal.css";

const props = defineProps<{
  triggerProps?: UIButtonProps;
  isHotkey?: boolean;
}>();

const ResponsiveModal = useResponsiveModal();
const isDesktop = useMediaQuery(`(min-width: ${responsiveModalBreakpoint})`);

const triggerRef = useTemplateRef("trigger");

onMounted(() => {
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (!props.isHotkey || !e.ctrlKey || !e.shiftKey || e.code !== "Comma") {
      return;
    }

    e.preventDefault();

    const openedModals = document.querySelectorAll(
      '[data-slot="dialog-overlay"][data-state="open"], [data-slot="drawer-content"][data-state="open"]',
    );

    // i'm lazy to fix problems caused by opening multiple same-level modals,
    // so solve them in this way
    if (openedModals.length) return;

    const trigger = triggerRef.value?.$el as HTMLElement | null | undefined;
    const otherOpenedSettingsButtons = Array.from(
      document.querySelectorAll(
        '[data-settings-button="true"][data-state="open"]',
      ),
    ).filter(elem => elem !== trigger) as HTMLElement[];

    if (otherOpenedSettingsButtons.length) {
      otherOpenedSettingsButtons.forEach(elem => elem.click());
    } else {
      trigger?.click();
    }
  });
});
</script>
