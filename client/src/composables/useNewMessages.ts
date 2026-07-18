import { useRoomStore } from "@/stores/room";
import type { Message } from "@speak-up/shared";
import _ from "lodash";
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

function useNewMessages(isToCleanup?: MaybeRefOrGetter<boolean>) {
  const roomStore = useRoomStore();
  const newMessageIds = ref<
    { id: Message["id"]; tempId?: Message["tempId"] }[]
  >([]);

  const messagesGetter = () =>
    roomStore.room?.messages ? [...roomStore.room.messages] : undefined;

  watch(
    () => toValue(isToCleanup),
    value => {
      if (value) newMessageIds.value = [];
    },
  );

  watch(
    [messagesGetter, () => roomStore.room?.id],
    ([newMessages, newRoomId], [oldMessages, oldRoomId]) => {
      if (toValue(isToCleanup)) return;

      function calcNewMessageIds() {
        if (
          !newMessages?.length ||
          !newRoomId ||
          !oldMessages ||
          newMessages.length <= oldMessages.length
        ) {
          return [];
        }

        let onlyNewMessages: Message[];
        if (newRoomId === oldRoomId) {
          onlyNewMessages = _.union(
            _.xorBy(newMessages, oldMessages, "id"),
            _.xorBy(newMessages, oldMessages, "tempId"),
          );
        } else {
          onlyNewMessages = newMessages;
        }

        return Array.from(
          new Set(
            onlyNewMessages.map(message => ({
              id: message.id,
              tempId: message.tempId,
            })),
          ),
        );
      }

      newMessageIds.value = newMessageIds.value.concat(calcNewMessageIds());
    },
    { immediate: true },
  );

  const newMessages = computed<Message[]>(
    () =>
      newMessageIds.value
        ?.map(ids =>
          roomStore.room?.messages.find(
            message =>
              message.id === ids.id ||
              (message.tempId && message.tempId === ids.tempId),
          ),
        )
        .filter(value => !!value) || [],
  );

  return newMessages;
}

export default useNewMessages;
