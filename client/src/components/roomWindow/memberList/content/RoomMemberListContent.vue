<template>
  <UIScrollbar :class="styles.root">
    <section :class="styles.section">
      <h3 :class="styles.heading">
        On the meeting
        <span aria-hidden="true" :class="styles.memberAmount">
          ( {{ sortedMembers.length }} / {{ roomStore.room?.maxMembers }} )
        </span>
        <span class="sr-only">
          ({{ sortedMembers.length }} out of {{ roomStore.room?.maxMembers }})
        </span>
      </h3>
      <dl :class="styles.dl">
        <div
          v-for="user in sortedMembers"
          :class="styles.member"
          :key="user.id"
        >
          <dt :class="styles.dt">
            <img
              :src="user.picture"
              alt=""
              draggable="false"
              :class="styles.picture"
            />
            <div
              v-if="checkIsHost(user.id)"
              :class="styles.nicknameRoleWrapper"
            >
              <h4 :class="cn(styles.nickname, 'truncate')">
                {{ user.nickname }}
              </h4>
              <strong :class="styles.role">Organizator</strong>
            </div>
            <h4 v-else :class="cn(styles.nickname, 'truncate')">
              {{ user.nickname }}
            </h4>
          </dt>
          <dd :class="styles.dd">
            <ul :class="styles.actions">
              <li>
                <PinRoomMember :userId="user.id" v-slot="slotProps">
                  <UIButton
                    variant="secondary"
                    :size="getIconButtonSize(user.id)"
                    :aria-label="slotProps['aria-label']"
                    @click="slotProps.click"
                  >
                    <component :is="slotProps.icon" />
                  </UIButton>
                </PinRoomMember>
              </li>
              <li v-if="checkIsSharingScreen(user.id)">
                <PinScreenSharing :userId="user.id" v-slot="slotProps">
                  <UIButton
                    variant="secondary"
                    :size="getIconButtonSize(user.id)"
                    :aria-label="slotProps['aria-label']"
                    @click="slotProps.click"
                  >
                    <component :is="slotProps.icon" />
                  </UIButton>
                </PinScreenSharing>
              </li>
              <li v-if="checkCanRemoveUser(user.id)">
                <UIButton
                  variant="destructive"
                  size="xs"
                  :disabled="hostStore.userIdsToRemove.includes(user.id)"
                  @click="hostStore.removeUser(user.id)"
                >
                  Remove
                </UIButton>
              </li>
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  </UIScrollbar>
</template>

<script setup lang="ts">
import PinRoomMember from "@/components/pin/member/PinRoomMember.vue";
import PinScreenSharing from "@/components/pin/screenSharing/PinScreenSharing.vue";
import UIScrollbar from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { useAuthStore } from "@/stores/auth";
import { useHostStore } from "@/stores/host";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import { useWebRTCStore } from "@/stores/webrtc";
import { cn } from "@/utils/shadcn/utils";
import { computed } from "vue";
import * as styles from "./RoomMemberListContent.css";

function checkIsSharingScreen(userId: string): boolean {
  return userId === authStore.user?.id
    ? mediaStore.isSharingScreen
    : !!webRTCStore.remoteStreams.get(userId)?.screenSharing?.active;
}

function checkIsHost(userId: string): boolean {
  return userId === roomStore.room?.hostId;
}

function checkCanRemoveUser(userId: string): boolean {
  return checkIsHost(authStore.user?.id || "") && userId !== authStore.user?.id;
}

function getIconButtonSize(userId: string): "icon-sm" | "icon-xs" {
  return checkCanRemoveUser(userId) ? "icon-xs" : "icon-sm";
}

const authStore = useAuthStore();
const mediaStore = useMediaStore();
const roomStore = useRoomStore();
const webRTCStore = useWebRTCStore();
const hostStore = useHostStore();

const sortedMembers = computed(() => {
  if (!roomStore.room) return [];
  const host = roomStore.room.users.find(
    user => user.id === roomStore.room?.hostId,
  );

  if (host) {
    return [host, ...roomStore.room.users.filter(user => user !== host)];
  } else {
    return roomStore.room.users;
  }
});
</script>
