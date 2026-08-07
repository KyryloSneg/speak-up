import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useMediaStore } from "@/stores/media";
import { useWebRTCStore } from "@/stores/webrtc";
import type { FullScreenItem } from "@/types/fullScreen";
import type { RoomMediaConfigUserId } from "@/types/media";
import type { PinnedItem } from "@/types/pin";
import type { Room } from "@/types/room";
import { RoutesWithoutParams } from "@/types/routes";
import socket from "@/utils/socket";
import updateUser from "@/utils/updateUser";
import {
  objectEntries,
  SocketEvents,
  SocketResponseEvents,
  type SocketMediaConfig,
  type UserDto,
} from "@speak-up/shared";
import _ from "lodash";
import { nanoid } from "nanoid";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

export const useRoomStore = defineStore("room", () => {
  const authStore = useAuthStore();
  const room = ref<Room | null>(null);

  const maxMembersOfFutureRoom = ref<Room["maxMembers"] | null>(null);
  const roomIdUserIsTryingToJoin = ref<Room["id"] | null>(null);
  const initSentMediaConfig = ref<SocketMediaConfig | null>(null);

  const pinnedItems = ref<PinnedItem[] | null>();

  const isJoining = ref(false);
  const isToSupressLeaveConfirm = ref(false);

  const openedWindow = ref<"chat" | "memberList" | null>(null);
  const memberListTrigger = ref<string | null>(null);

  const fullScreenItem = ref<FullScreenItem | null>(null);
  const memberAnnouncerText = ref("");

  function cleanup(isToRedirect: boolean = true): void {
    const mediaStore = useMediaStore();
    const webRTCStore = useWebRTCStore();

    room.value = null;
    mediaStore.roomConfigs = null;

    openedWindow.value = null;
    memberListTrigger.value = null;

    maxMembersOfFutureRoom.value = null;
    roomIdUserIsTryingToJoin.value = null;
    initSentMediaConfig.value = null;
    pinnedItems.value = null;
    fullScreenItem.value = null;

    memberAnnouncerText.value = "";
    isJoining.value = false;

    if (isToRedirect) {
      isToSupressLeaveConfirm.value = true;
      router.push(RoutesWithoutParams.HOME);
    }

    mediaStore.stopScreenSharing();
    webRTCStore.stop();
  }

  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.CREATE_ROOM)
      .on(SocketResponseEvents.CREATE_ROOM, data => {
        if (!maxMembersOfFutureRoom.value) return;

        if ("error" in data) {
          toast.error(data.error);
        } else {
          const mediaStore = useMediaStore();

          function generateUsers(
            users: UserDto[],
            repeatTimes: number = 0,
          ): UserDto[] {
            return users.concat(
              Array.from({ length: repeatTimes }).reduce(
                (acc: UserDto[]) =>
                  acc
                    .concat(users.map(user => ({ ...user, id: nanoid() })))
                    .flat(),
                [],
              ),
            );
          }

          room.value = {
            id: data.id,
            hostId: authStore.user!.id,
            users: generateUsers([authStore.user!], 0),
            messages: [],
            maxMembers: maxMembersOfFutureRoom.value,
          };

          pinnedItems.value = [];
          mediaStore.roomConfigs = new Map();

          router.push(RoutesWithoutParams.ROOM);

          if (!_.isEqual(mediaStore.config, initSentMediaConfig.value)) {
            mediaStore.sendMediaConfig(mediaStore.config);
          }
        }

        isJoining.value = false;
      });

    socket
      .off(SocketResponseEvents.JOIN_ROOM)
      .on(SocketResponseEvents.JOIN_ROOM, data => {
        if (!roomIdUserIsTryingToJoin.value) return;

        if ("error" in data) {
          toast.error(data.error);
        } else {
          const mediaStore = useMediaStore();
          const webRTCStore = useWebRTCStore();

          room.value = {
            id: roomIdUserIsTryingToJoin.value,
            hostId: data.hostId,
            users: data.users,
            messages: data.messages,
            maxMembers: data.maxMembers,
          };

          pinnedItems.value = [];
          mediaStore.roomConfigs = new Map(
            objectEntries(data.mediaConfigs)
              .map(([userId, config]) => {
                const typedUserId = userId as RoomMediaConfigUserId;
                return [
                  typedUserId,
                  { userId: typedUserId, ...config },
                ] as const;
              })
              .filter(entries => entries[0] !== authStore.user?.id),
          );

          router.push(RoutesWithoutParams.ROOM);

          if (!_.isEqual(mediaStore.config, initSentMediaConfig.value)) {
            mediaStore.sendMediaConfig(mediaStore.config);
          }

          data.users.forEach(user => {
            if (user.id === authStore.user?.id) return;
            webRTCStore.createPeerConnection(user.id);
          });
        }

        roomIdUserIsTryingToJoin.value = null;
        isJoining.value = false;
      });

    socket
      .off(SocketResponseEvents.LEAVE_ROOM)
      .on(SocketResponseEvents.LEAVE_ROOM, data => toast.error(data.error));

    socket.off(SocketEvents.USER_JOINED).on(SocketEvents.USER_JOINED, data => {
      if (!room.value) return;

      const mediaStore = useMediaStore();
      const webRTCStore = useWebRTCStore();

      const typedUserId = data.user.id as RoomMediaConfigUserId;

      room.value.users.push(data.user);
      mediaStore.roomConfigs?.set(typedUserId, {
        userId: typedUserId,
        ...data.mediaConfig,
      });

      webRTCStore.createPeerConnection(data.user.id);
      memberAnnouncerText.value = `User "${data.user.nickname}" have joined`;
    });

    socket.off(SocketEvents.USER_LEFT).on(SocketEvents.USER_LEFT, data => {
      if (!room.value) return;
      const leftUser = room.value.users.find(user => user.id === data.userId);

      room.value.users = room.value.users.filter(
        user => user.id !== data.userId,
      );

      const mediaStore = useMediaStore();
      const webRTCStore = useWebRTCStore();

      mediaStore.roomConfigs?.delete(data.userId as RoomMediaConfigUserId);
      webRTCStore.removePeerConnection(data.userId);

      if (leftUser) {
        memberAnnouncerText.value = `User "${leftUser.nickname}" have left`;
      }
    });

    socket.off(SocketEvents.LEFT_ROOM).on(SocketEvents.LEFT_ROOM, data => {
      if (!room.value || room.value.id !== data.id) return;
      cleanup();
    });

    socket
      .off(SocketEvents.CHANGED_NICKNAME)
      .on(SocketEvents.CHANGED_NICKNAME, data => {
        // update room user data
        if (room.value) {
          const roomUser = room.value.users.find(
            user => user.id === data.userId,
          );

          if (roomUser) {
            updateUser(roomUser, data);
            room.value.messages.forEach(message =>
              updateUser(message.user, data),
            );
          }
        }

        // other tabs synchronization
        if (data.userId === authStore.user?.id) {
          updateUser(authStore.user, data);
        }
      });
  }

  function createRoom(maxMembers: number): void {
    const mediaStore = useMediaStore();
    socket.emit(SocketEvents.CREATE_ROOM, {
      maxMembers,
      mediaConfig: mediaStore.config,
    });

    maxMembersOfFutureRoom.value = maxMembers;
    initSentMediaConfig.value = mediaStore.config;

    isJoining.value = true;
  }

  function joinRoom(id: string): void {
    const mediaStore = useMediaStore();
    socket.emit(SocketEvents.JOIN_ROOM, { id, mediaConfig: mediaStore.config });

    roomIdUserIsTryingToJoin.value = id;
    initSentMediaConfig.value = mediaStore.config;

    isJoining.value = true;
  }

  function leaveRoom(isToRedirect: boolean = true): void {
    socket.emit(SocketEvents.LEAVE_ROOM);

    if (isToRedirect) {
      isToSupressLeaveConfirm.value = true;
      router.push(RoutesWithoutParams.HOME);
    }

    cleanup(false);
  }

  const sortedUsers = computed(() => {
    const users = room.value?.users;
    if (!users) return [];

    return [...users].sort((a, b) => {
      if (a.id === authStore.user?.id) return -1;

      if (!a.lastSpeakedAt && !b.lastSpeakedAt) return 0;
      if (!a.lastSpeakedAt) return 1;
      if (!b.lastSpeakedAt) return -1;

      return a.lastSpeakedAt.getTime() - b.lastSpeakedAt.getTime();
    });
  });

  return {
    room,
    maxMembersOfFutureRoom,
    roomIdUserIsTryingToJoin,
    initSentMediaConfig,
    pinnedItems,
    isJoining,
    isToSupressLeaveConfirm,
    openedWindow,
    memberListTrigger,
    fullScreenItem,
    memberAnnouncerText,
    sortedUsers,
    cleanup,
    bindEvents,
    createRoom,
    joinRoom,
    leaveRoom,
  };
});
