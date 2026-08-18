import $api from "@/http";
import { useAuthStore } from "@/stores/auth";
import { LocalStorageKeys } from "@/types/localStorage";
import connectToSocketAndBindToAllEvents from "@/utils/connectToSocketAndBindToAllEvents";
import handleLogout from "@/utils/handleLogout";
import socket from "@/utils/socket";
import {
  SocketAuthConnectionErrorCode,
  SocketEvents,
  type SocketAuthConnectionError,
} from "@speak-up/shared";
import { defineStore } from "pinia";
import { toast } from "vue-sonner";

export const useSocketStore = defineStore("socket", () => {
  function bindEvents(): void {
    async function reconnectWithNewToken(
      condition: boolean = true,
    ): Promise<void> {
      if (condition) {
        const refreshResponse = await $api.auth.refresh();
        if (!refreshResponse.data) return await handleLogout();

        const {
          tokens: { accessToken },
        } = refreshResponse.data;

        localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, accessToken);
        connectToSocketAndBindToAllEvents();
      } else {
        toast.error(
          "Failed to connect to socket. Some functions might not work correctly.",
        );
      }
    }

    socket
      .off(SocketEvents.CONNECT_ERROR)
      .on(SocketEvents.CONNECT_ERROR, async e => {
        const authError = e as SocketAuthConnectionError;

        await reconnectWithNewToken(
          authError.data?.code === SocketAuthConnectionErrorCode,
        );
      });

    socket
      .off(SocketEvents.DISCONNECT)
      .on(SocketEvents.DISCONNECT, async () => {
        const authStore = useAuthStore();
        if (authStore.isAuth) await reconnectWithNewToken();
      });
  }

  function connect(): void {
    const authStore = useAuthStore();

    if (!authStore.isAuth) {
      if (socket.connected) socket.disconnect();
      return;
    }

    if (socket.connected) return;
    connectToSocketAndBindToAllEvents();
  }

  return { bindEvents, connect };
});
