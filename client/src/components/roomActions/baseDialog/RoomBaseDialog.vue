<template>
  <component :is="ResponsiveModal.Root" v-model:open="open">
    <component :is="ResponsiveModal.Trigger" as-child>
      <slot name="trigger" />
    </component>
    <component
      :is="ResponsiveModal.Content"
      :class="styles.content"
      @open-auto-focus="handleAutofocus"
    >
      <component :is="ResponsiveModal.Header" :class="styles.header">
        <component :is="ResponsiveModal.Title" :class="styles.title">
          <slot name="title" />
        </component>
        <component
          v-if="$slots.description"
          :is="ResponsiveModal.Description"
          class="sr-only"
        >
          <slot name="description" />
        </component>
      </component>
      <slot :dataSlot="styles.actualContentSlot" />
      <component
        v-if="$slots.footer"
        :is="ResponsiveModal.Footer"
        :class="styles.footer"
      >
        <slot name="footer" />
      </component>
    </component>
  </component>
</template>

<script setup lang="ts">
import useResponsiveModal from "@/composables/useResponsiveModal";
import * as styles from "./RoomBaseDialog.css";

defineSlots<{
  default(props: { dataSlot: string }): unknown;
  trigger(): unknown;
  title(): unknown;
  description(): unknown;
  footer(): unknown;
}>();

defineProps<{
  handleAutofocus?: (e: Event) => void;
}>();

const open = defineModel<boolean>("open", { default: false });
const ResponsiveModal = useResponsiveModal();
</script>
