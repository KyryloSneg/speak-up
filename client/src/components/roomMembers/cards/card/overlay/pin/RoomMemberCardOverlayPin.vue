<template>
  <PinRoomMember :userId :isCardOverlay="true" v-slot="slotProps">
    <BaseRoomMemberCardOverlayButton
      :aria-label="slotProps['aria-label']"
      @click="slotProps.click"
    >
      <component :is="slotProps.icon" />
    </BaseRoomMemberCardOverlayButton>
  </PinRoomMember>
</template>

<script setup lang="ts">
import PinRoomMember from "@/components/pin/member/PinRoomMember.vue";
import BaseRoomMemberCardOverlayButton from "@/components/roomMembers/cards/card/overlay/base/BaseRoomMemberCardOverlayButton.vue";

defineProps<{
  userId: string;
}>();
</script>
