<template>
  <PinScreenSharing :userId :isCardOverlay="true" v-slot="slotProps">
    <BaseRoomMemberCardOverlayButton
      :aria-label="slotProps['aria-label']"
      @click="slotProps.click"
    >
      <component :is="slotProps.icon" />
    </BaseRoomMemberCardOverlayButton>
  </PinScreenSharing>
</template>

<script setup lang="ts">
import PinScreenSharing from "@/components/pin/screenSharing/PinScreenSharing.vue";
import BaseRoomMemberCardOverlayButton from "@/components/roomMembers/cards/card/overlay/base/BaseRoomMemberCardOverlayButton.vue";

defineProps<{
  userId: string;
}>();
</script>
