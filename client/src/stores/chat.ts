import type { UIScrollbarTemplateRef } from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import useNewMessages from "@/composables/useNewMessages";
import { useRoomStore } from "@/stores/room";
import { defineStore } from "pinia";
import { computed, ref, watch, watchEffect } from "vue";

// RoomChat component store
export const useChatStore = defineStore("chat", () => {
  const roomStore = useRoomStore();

  const scrolledPx = ref(0);
  const scrollTemplateRef = ref<UIScrollbarTemplateRef | null>(null);

  const isInitScrolled = ref(false);
  const isScrollDownButton = ref(false);
  const areNewMessages = ref(false);

  watch(
    () => roomStore.room?.id,
    (roomId, oldRoomId) => {
      if (roomId === oldRoomId) return;

      scrolledPx.value = 0;
      scrollTemplateRef.value = null;
      isInitScrolled.value = false;
      isScrollDownButton.value = false;
      areNewMessages.value = false;
    },
  );

  watchEffect(() => {
    isScrollDownButton.value =
      scrolledPx.value > (areNewMessages.value ? 10 : 200);
  });


  const newMessages = useNewMessages(() => scrolledPx.value < 10);
  const newMessagesUserIds = computed(() =>
    Array.from(new Set(newMessages.value.map(message => message.userId))),
  );

  function scrollTo(
    x: number = 0,
    y: number = 0,
    options?: ScrollOptions,
  ): void {
    const elem = scrollTemplateRef.value?.viewport;
    if (!elem) return;

    elem.scrollTo({ left: x, top: y, ...(options || {}) });
  }

  return {
    scrolledPx,
    scrollTemplateRef,
    isInitScrolled,
    isScrollDownButton,
    areNewMessages,
    newMessages,
    newMessagesUserIds,
    scrollTo,
  };
});
