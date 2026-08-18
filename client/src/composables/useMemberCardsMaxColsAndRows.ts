import { useRoomStore } from "@/stores/room";
import calcMemberCardsMaxColsAndRows from "@/utils/roomMemberCards/calcMemberCardsMaxColsAndRows";
import { useElementSize } from "@vueuse/core";
import { computed, type TemplateRef } from "vue";

function useMemberCardsMaxColsAndRows(templateRef: TemplateRef<HTMLElement>) {
  const roomStore = useRoomStore();
  const { width, height } = useElementSize(templateRef);

  const isElementInitialized = computed(() => !!width.value && !!height.value);
  const boundaries = computed(() => {
    const totalItems = roomStore.room?.users.length;
    if (!isElementInitialized.value || !totalItems) return null;

    return calcMemberCardsMaxColsAndRows(totalItems, width.value, height.value);
  });

  return boundaries;
}

export default useMemberCardsMaxColsAndRows;
