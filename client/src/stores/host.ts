import socket from "@/utils/socket";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { defineStore } from "pinia";
import { toast } from "vue-sonner";

// host-only actions
export const useHostStore = defineStore("host", () => {
  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.REMOVE_USER)
      .on(SocketResponseEvents.REMOVE_USER, data => toast.error(data.error));
  }

  function removeUser(userId: string): void {
    socket.emit(SocketEvents.REMOVE_USER, { userId });
  }

  return { bindEvents, removeUser };
});
