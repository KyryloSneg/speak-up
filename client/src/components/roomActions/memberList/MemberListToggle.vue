<template>
  <RoomMemberListTrigger :isToggle="true" v-slot="slotProps">
    <BaseAsideToggle
      v-bind="getAriaAttributesFromProps(slotProps)"
      :value="slotProps.value"
      :size
      :data-id="slotProps.dataId"
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
import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import getAriaAttributesFromProps from "@/utils/getAriaAttributesFromProps";
import { memberListToggleId } from "@/utils/idConsts";
import { PanelRightClose, Users } from "@lucide/vue";

defineProps<{
  size: ButtonVariants["size"];
}>();

const isOpenedWindow = useIsRoomOpenedWindow();
</script>
