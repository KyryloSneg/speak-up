import { useRoomStore } from "@/stores/room";
import socket from "@/utils/socket";
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
  type MessageContent,
} from "@speak-up/shared";
import { defineStore } from "pinia";
import { toast } from "vue-sonner";

export const useMessageStore = defineStore("message", () => {
  function bindEvents(): void {
    function pushMessage(message: Message): void {
      const roomStore = useRoomStore();
      if (!roomStore.room) return;

      roomStore.room.messages.push(message);
    }

    socket
      .off(SocketResponseEvents.SEND_MESSAGE)
      .on(SocketResponseEvents.SEND_MESSAGE, data => {
        if ("error" in data) {
          toast.error(data.error);
        } else {
          pushMessage(data.message);
        }
      });

    socket
      .off(SocketEvents.RECEIVED_MESSAGE)
      .on(SocketEvents.RECEIVED_MESSAGE, data => pushMessage(data.message));
  }

  function sendMessage(content: MessageContent): void {
    socket.emit(SocketEvents.SEND_MESSAGE, { content });
  }

  return { bindEvents, sendMessage };
});
