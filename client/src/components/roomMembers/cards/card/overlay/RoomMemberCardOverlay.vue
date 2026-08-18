<template>
  <ul
    v-if="isAnyItemShown"
    :class="cn(styles.list, 'shadow-md')"
    data-slot="overlay-item-list"
  >
    <li v-if="areItemsShown.pin">
      <RoomMemberCardOverlayPin :userId />
    </li>
    <li v-if="areItemsShown.volume">
      <RoomMemberCardOverlayVolume :userId :type />
    </li>
    <li v-if="areItemsShown.screenSharing">
      <RoomMemberCardOverlayScreenSharing :userId />
    </li>
    <li v-if="areItemsShown.fullScreen">
      <RoomMemberCardOverlayFullScreen :userId :type :streamInfo />
    </li>
  </ul>
</template>

<script setup lang="ts">
import RoomMemberCardOverlayFullScreen from "@/components/roomMembers/cards/card/overlay/fullScreen/RoomMemberCardOverlayFullScreen.vue";
import RoomMemberCardOverlayPin from "@/components/roomMembers/cards/card/overlay/pin/RoomMemberCardOverlayPin.vue";
import RoomMemberCardOverlayScreenSharing from "@/components/roomMembers/cards/card/overlay/screenSharing/RoomMemberCardOverlayScreenSharing.vue";
import RoomMemberCardOverlayVolume from "@/components/roomMembers/cards/card/overlay/volume/RoomMemberCardOverlayVolume.vue";
import useIsVideoActive from "@/composables/useIsVideoActive";
import { useAuthStore } from "@/stores/auth";
import type { RemoteStreams } from "@/stores/webrtc";
import { cn } from "@/utils/shadcn/utils";
import { computed } from "vue";
import * as styles from "./RoomMemberCardOverlay.css";

const props = defineProps<{
  userId: string;
  type: "user" | "screenSharing";
  streamInfo: RemoteStreams | null;
  isFullScreen: boolean;
}>();

const authStore = useAuthStore();
const isLocal = computed(() => props.userId === authStore.user?.id);

const isSharingScreen = useIsVideoActive(props.streamInfo?.screenSharing);

const areItemsShown = computed(() => ({
  pin: props.type === "user" && !props.isFullScreen,
  volume: !isLocal.value,
  screenSharing: isSharingScreen.value && !props.isFullScreen,
  fullScreen: !props.isFullScreen,
}));

const isAnyItemShown = computed(() =>
  Array.from(Object.values(areItemsShown.value)).some(isShown => !!isShown),
);
</script>
