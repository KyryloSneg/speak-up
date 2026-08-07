<template>
  <section
    v-if="user"
    tabindex="0"
    :class="
      styles.section({
        shadow: true,
        speaking,
        camera,
        fullscreen: isFullScreen,
        type,
      })
    "
    :style="assignInlineVars(inlineVars)"
    ref="card"
  >
    <template v-if="type === 'user'">
      <div
        v-if="!config.audio"
        role="status"
        aria-atomic="true"
        :class="cn(styles.noMic, 'shadow-sm')"
      >
        <span class="sr-only">Turned off microphone</span>
        <MicOff :class="styles.noMicIcon" />
      </div>
      <Transition :name="styles.screenSharingTransitionName">
        <div
          v-if="isSharingScreen"
          role="status"
          aria-atomic="true"
          :class="cn(styles.sharingScreen, 'shadow-sm')"
        >
          <span class="sr-only">Sharing screen</span>
          <Cast :class="styles.sharingScreenIcon" />
        </div>
      </Transition>
    </template>

    <MediaBg
      v-if="type === 'screenSharing' || camera"
      :isMuted="isFullScreen"
      :isLocal
      :isScreenSharing="type === 'screenSharing'"
      :srcObject="type === 'user' ? mediaStream : screenSharingStream"
      :volume="isLocal ? undefined : customVolume[0]"
      :class="styles.mediaBg"
    />
    <template v-else>
      <img
        :src="user.picture"
        alt=""
        draggable="false"
        :class="styles.picture"
      />
      <div :class="styles.colorBg" />
    </template>

    <component
      :is="isFullScreen ? 'h3' : 'h4'"
      :class="
        cn(
          'shadow-xs',
          styles.nickname({
            visible: type === 'user' || isOverlayVisible,
            bg: type === 'screenSharing' || camera,
          }),
          'truncate select-none',
        )
      "
    >
      {{ user.nickname }}
      <span v-if="type === 'screenSharing'" class="sr-only"> screen </span>
    </component>
    <Transition :name="styles.overlayTransitionName">
      <RoomMemberCardOverlay
        v-if="isOverlayVisible"
        :userId
        :type
        :streamInfo
        :isFullScreen
      />
    </Transition>
  </section>
</template>

<script setup lang="ts">
import RoomMemberCardOverlay from "@/components/roomMembers/cards/card/overlay/RoomMemberCardOverlay.vue";
import MediaBg from "@/components/userMedia/bg/MediaBg.vue";
import useAudioMeter from "@/composables/useAudioMeter";
import useAutoHidingOverlay from "@/composables/useAutoHidingOverlay";
import useCustomVolume from "@/composables/useCustomVolume";
import useIsVideoActive from "@/composables/useIsVideoActive";
import { useAuthStore } from "@/stores/auth";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import { useWebRTCStore, type RemoteStreams } from "@/stores/webrtc";
import type { RoomMediaConfig, RoomMediaConfigUserId } from "@/types/media";
import getImageColor from "@/utils/getImageColor";
import { cn } from "@/utils/shadcn/utils";
import { Cast, MicOff } from "@lucide/vue";
import {
  getContrastColor,
  getCssRGBFromRGB,
  getRGBFromCssRGB,
  getRGBFromHEX,
} from "@speak-up/shared";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { computedAsync } from "@vueuse/core";
import { computed, Transition, useTemplateRef, watchEffect } from "vue";
import * as styles from "./RoomMemberCard.css";

const props = defineProps<{
  userId: string;
  type: "user" | "screenSharing";
  isFullScreen?: boolean;
}>();

const authStore = useAuthStore();
const mediaStore = useMediaStore();
const roomStore = useRoomStore();
const webRTCStore = useWebRTCStore();

const user = computed(
  () => roomStore.room?.users.find(user => user.id === props.userId) || null,
);

const otherUsersLastSpeakedAt = computed(() =>
  roomStore.room?.users
    .filter(item => item !== user.value)
    .map(item => item.lastSpeakedAt)
    .filter(item => !!item),
);

const isLocal = computed(
  () => !!user.value && user.value.id === authStore.user?.id,
);

const backgroundColor = computedAsync(
  async () =>
    props.type === "user" && user.value
      ? getImageColor(user.value.picture)
      : undefined,
  undefined,
);

const inlineVars = computed(() => ({
  [styles.colorBgColor]: backgroundColor.value,
  [styles.pictureContrastColor]: backgroundColor.value
    ? getCssRGBFromRGB(
        getRGBFromHEX(
          getContrastColor(getRGBFromCssRGB(backgroundColor.value)),
        ),
      )
    : undefined,
}));

const DEFAULT_CONFIG = computed<RoomMediaConfig>(
  () =>
    ({
      userId: (user.value?.id || "userId") as RoomMediaConfigUserId,
      audio: false,
      video: false,
    }) as const,
);

const config = computed<RoomMediaConfig>(() =>
  user.value
    ? isLocal.value
      ? { userId: user.value.id as RoomMediaConfigUserId, ...mediaStore.config }
      : mediaStore.roomConfigs?.get(user.value.id as RoomMediaConfigUserId) ||
        DEFAULT_CONFIG.value
    : DEFAULT_CONFIG.value,
);

const streamInfo = computed<RemoteStreams | null>(() =>
  user.value
    ? isLocal.value
      ? {
          userMedia: mediaStore.userMediaStream,
          screenSharing: mediaStore.screenSharingStream,
        }
      : webRTCStore.remoteStreams.get(user.value.id) || null
    : null,
);

const mediaStream = computed(() => streamInfo.value?.userMedia);
const screenSharingStream = computed(() => streamInfo.value?.screenSharing);

const { volume } = useAudioMeter(() =>
  props.type === "user" ? mediaStream.value?.getAudioTracks()?.[0] : undefined,
);

const isVideoActiveStream = computed(() =>
  props.type === "user" ? mediaStream.value : undefined,
);

const isSharingScreenStream = computed(() =>
  props.type === "user" ? screenSharingStream.value : undefined,
);

const isVideoActive = useIsVideoActive(isVideoActiveStream);
const isSharingScreen = useIsVideoActive(isSharingScreenStream);

const speaking = computed(() => volume.value >= 5);
const camera = computed(() => config.value.video && isVideoActive.value);

const cardRef = useTemplateRef("card");
const autoHidingOverlay = useAutoHidingOverlay(cardRef);

const isOpenedInFullScreen = computed(
  () =>
    roomStore.fullScreenItem?.userId === props.userId &&
    roomStore.fullScreenItem.type === props.type,
);

const isOverlayVisible = computed(
  () =>
    autoHidingOverlay.value ||
    (!props.isFullScreen && isOpenedInFullScreen.value),
);

const customVolume = useCustomVolume(props.userId, props.type);

watchEffect(() => {
  if (
    props.type === "screenSharing" ||
    props.isFullScreen ||
    volume.value < 10 ||
    !user.value
  ) {
    return;
  }

  if (user.value.lastSpeakedAt) {
    const isLaterDate = otherUsersLastSpeakedAt.value?.some(
      lastSpeakedAt =>
        lastSpeakedAt.getTime() - (user.value?.lastSpeakedAt?.getTime() || 0) >
        0,
    );

    // do not update user state if it would change basically nothing
    // (if this user speaks last and does it after some group silence,
    // layout doesn't get changed)
    if (!isLaterDate) return;
  }

  user.value.lastSpeakedAt = new Date();
});
</script>
