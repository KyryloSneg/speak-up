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
              <span :class="styles.role">Organizator</span>
            </div>
            <h4 v-else :class="cn(styles.nickname, 'truncate')">
              {{ user.nickname }}
            </h4>
          </dt>
          <dd
            :class="
              styles.dd({
                visibility: checkIsDDVisible(user.id) ? 'visible' : 'hidden',
              })
            "
          >
            <UIButton
              v-if="checkIsDDVisible(user.id)"
              variant="destructive"
              size="sm"
              :disabled="hostStore.userIdsToRemove.includes(user.id)"
              @click="hostStore.removeUser(user.id)"
            >
              Remove
            </UIButton>
            <span v-else class="sr-only">
              You can't do anything with this user
            </span>
          </dd>
        </div>
      </dl>
    </section>
  </UIScrollbar>
</template>

<script setup lang="ts">
import UIScrollbar from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import UIButton from "@/components/ui/shadcn/button/UIButton.vue";
import { useAuthStore } from "@/stores/auth";
import { useHostStore } from "@/stores/host";
import { useRoomStore } from "@/stores/room";
import { cn } from "@/utils/shadcn/utils";
import { computed } from "vue";
import * as styles from "./RoomMemberListContent.css";

function checkIsHost(userId: string): boolean {
  return userId === roomStore.room?.hostId;
}

function checkIsDDVisible(userId: string): boolean {
  return checkIsHost(authStore.user?.id || "") && userId !== authStore.user?.id;
}

const authStore = useAuthStore();
const roomStore = useRoomStore();
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
