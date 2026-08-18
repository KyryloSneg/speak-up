<template>
  <RoomMemberListTrigger :isToggle="true" v-slot="slotProps">
    <BaseAsideToggle
      v-bind="getAriaAttributesFromProps(slotProps)"
      :value="slotProps.value"
      :size
      :data-id="slotProps.dataId"
      aria-keyshortcuts="Control+Alt+P Control+Meta+P"
      :id="memberListToggleId"
      @click="slotProps.click"
    >
      <PanelRightClose v-if="!slotProps.isDialog && slotProps.value" />
      <Users v-else />
    </BaseAsideToggle>
  </RoomMemberListTrigger>
</template>

<script setup lang="ts">
import BaseAsideToggle from "@/components/roomActions/base/BaseAsideToggle.vue";
import RoomMemberListTrigger from "@/components/roomMemberListTrigger/RoomMemberListTrigger.vue";
import type { ButtonVariants } from "@/components/ui/shadcn/button";
import getAriaAttributesFromProps from "@/utils/getAriaAttributesFromProps";
import { memberListToggleId } from "@/utils/idConsts";
import { PanelRightClose, Users } from "@lucide/vue";
import { useEventListener } from "@vueuse/core";
import { onMounted } from "vue";

defineProps<{
  size: ButtonVariants["size"];
}>();

onMounted(() => {
  useEventListener(document, "keydown", (e: KeyboardEvent) => {
    if (!e.altKey && !e.metaKey) return;
    if (!e.ctrlKey || e.code !== "KeyP") return;

    e.preventDefault();

    const button = document.getElementById(memberListToggleId);
    button?.click();
  });
});
</script>
