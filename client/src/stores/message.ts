import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import type { MessageGroup } from "@/types/message";
import socket from "@/utils/socket";
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
  type MessageContent,
  type SocketClientToServerEventsData,
} from "@speak-up/shared";
import { useDebounceFn } from "@vueuse/core";
import { nanoid } from "nanoid";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

export const useMessageStore = defineStore("message", () => {
  const batch = ref<
    SocketClientToServerEventsData[typeof SocketEvents.SEND_MESSAGE][number][]
  >([]);

  function bindEvents(): void {
    function pushMessage(
      message: Message,
      isOwnMessage: boolean = false,
    ): void {
      const roomStore = useRoomStore();
      if (!roomStore.room) return;

      if (isOwnMessage) {
        for (const pushedMessage of roomStore.room.messages) {
          if (pushedMessage.tempId !== message.tempId) continue;
          delete pushedMessage.tempId;

          pushedMessage.id = message.id;
          pushedMessage.createdAt = message.createdAt;
        }
      } else {
        if (roomStore.room.messages.some(item => item.id === message.id)) {
          return;
        }

        roomStore.room.messages.push(message);
      }
    }

    function removeMessage(tempId: string): void {
      const roomStore = useRoomStore();
      if (!roomStore.room) return;

      roomStore.room.messages = roomStore.room.messages.filter(
        message => message.tempId !== tempId,
      );
    }

    socket
      .off(SocketResponseEvents.SEND_MESSAGE)
      .on(SocketResponseEvents.SEND_MESSAGE, data => {
        if ("error" in data) {
          toast.error(data.error);
          // possibly, we can clear every single optimistic message but it's
          // pretty risky, so just don't break the server initial validation
          if (data.tempId) removeMessage(data.tempId);
        } else {
          pushMessage(data.message, true);
        }
      });

    socket
      .off(SocketEvents.RECEIVED_MESSAGE)
      .on(SocketEvents.RECEIVED_MESSAGE, data => pushMessage(data.message));
  }

  function sendMessage(content: MessageContent): void {
    const authStore = useAuthStore();
    if (!authStore.isAuth) return;

    const roomStore = useRoomStore();
    if (!roomStore.room) return;

    const tempId = nanoid();
    batch.value.push({ tempId, content });

    debouncedEmitSendMessage();
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      userId: authStore.user!.id,
      user: {
        nickname: authStore.user!.nickname,
        picture: authStore.user!.picture,
      },
      content,
      createdAt: new Date().toISOString(),
    } as const;

    roomStore.room.messages.push(optimisticMessage);
  }

  const debouncedEmitSendMessage = useDebounceFn(() => {
    if (batch.value.length) socket.emit(SocketEvents.SEND_MESSAGE, batch.value);
    batch.value = [];
  }, 150);

  const messageGroups = computed<MessageGroup[] | null>(() => {
    const roomStore = useRoomStore();
    if (!roomStore.room) return null;

    const result: MessageGroup[] = [];
    let currentMessageGroup: MessageGroup | null = null;

    for (const message of roomStore.room.messages) {
      if (
        !currentMessageGroup ||
        currentMessageGroup.userId !== message.userId
      ) {
        if (currentMessageGroup) {
          result.push(currentMessageGroup);
          currentMessageGroup = null;
        }

        currentMessageGroup = {
          id: `group-${nanoid()}`,
          userId: message.userId,
          nickname: message.user.nickname,
          picture: message.user.picture,
          messages: [message],
        };
      } else {
        currentMessageGroup.messages.push(message);
      }
    }

    if (currentMessageGroup) result.push(currentMessageGroup);
    return result;
  });

  return { messageGroups, bindEvents, sendMessage };
});
