import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useMediaStore } from "@/stores/media";
import type { RoomMediaConfigUserId } from "@/types/media";
import type { Room } from "@/types/room";
import { RoutesWithoutParams } from "@/types/routes";
import socket from "@/utils/socket";
import updateUser from "@/utils/updateUser";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toast } from "vue-sonner";

export const useRoomStore = defineStore("room", () => {
  const room = ref<Room | null>(null);
  const roomIdUserIsTryingToJoin = ref<Room["id"] | null>(null);
  const isJoining = ref(false);

  const isChatOpened = ref(false);
  const isMemberListOpened = ref(false);

  function cleanup(isToRedirect: boolean = true): void {
    const mediaStore = useMediaStore();

    room.value = null;
    mediaStore.roomConfigs = null;

    isChatOpened.value = false;
    isMemberListOpened.value = false;

    if (isToRedirect) router.push(RoutesWithoutParams.HOME);
  }

  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.CREATE_ROOM)
      .on(SocketResponseEvents.CREATE_ROOM, data => {
        if ("error" in data) {
          toast.error(data.error);
        } else {
          const authStore = useAuthStore();
          room.value = { id: data.id, users: [authStore.user!], messages: [] };

          router.push(RoutesWithoutParams.ROOM);
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

          room.value = {
            id: roomIdUserIsTryingToJoin.value,
            users: data.users,
            messages: data.messages,
          };

          // TODO: start retrieving room configs starting right from here ???
          mediaStore.roomConfigs = new Map();
          router.push(RoutesWithoutParams.ROOM);
        }

        roomIdUserIsTryingToJoin.value = null;
        isJoining.value = false;
      });

    socket
      .off(SocketResponseEvents.LEAVE_ROOM)
      .on(SocketResponseEvents.LEAVE_ROOM, data => toast.error(data.error));

    socket.off(SocketEvents.USER_JOINED).on(SocketEvents.USER_JOINED, data => {
      if (!room.value) return;
      room.value.users.push(data.user);
    });

    socket.off(SocketEvents.USER_LEFT).on(SocketEvents.USER_LEFT, data => {
      if (!room.value) return;
      room.value.users = room.value.users.filter(
        user => user.id !== data.userId,
      );

      const mediaStore = useMediaStore();
      mediaStore.roomConfigs?.delete(data.userId as RoomMediaConfigUserId);
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

          if (roomUser) updateUser(roomUser, data);
        }

        // other tabs synchronization
        const authStore = useAuthStore();
        if (data.userId === authStore.user?.id) {
          updateUser(authStore.user, data);
        }
      });
  }

  function createRoom(maxMembers: number): void {
    socket.emit(SocketEvents.CREATE_ROOM, { maxMembers });
    isJoining.value = true;
  }

  function joinRoom(id: string): void {
    socket.emit(SocketEvents.JOIN_ROOM, { id });
    roomIdUserIsTryingToJoin.value = id;

    isJoining.value = true;
  }

  function leaveRoom(isToRedirect: boolean = true): void {
    socket.emit(SocketEvents.LEAVE_ROOM);
    if (isToRedirect) router.push(RoutesWithoutParams.HOME);

    cleanup(false);
  }

  return {
    room,
    roomIdUserIsTryingToJoin,
    isJoining,
    isChatOpened,
    isMemberListOpened,
    cleanup,
    bindEvents,
    createRoom,
    joinRoom,
    leaveRoom,
  };
});
