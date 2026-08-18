import socket from "@/utils/socket";
import {
  SocketEvents,
  SocketResponseEvents,
  type UserDto,
} from "@speak-up/shared";
import { defineStore } from "pinia";
import { ref } from "vue";
import { toast } from "vue-sonner";

// host-only actions
export const useHostStore = defineStore("host", () => {
  const userIdsToRemove = ref<UserDto["id"][]>([]);

  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.REMOVE_USER)
      .on(SocketResponseEvents.REMOVE_USER, data => toast.error(data.error));
  }

  function removeUser(userId: string): void {
    if (userIdsToRemove.value.includes(userId)) return;

    socket.emit(SocketEvents.REMOVE_USER, { userId });
    userIdsToRemove.value.push(userId);
  }

  return { userIdsToRemove, bindEvents, removeUser };
});
