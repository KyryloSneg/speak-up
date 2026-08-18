import { useAuthStore } from "@/stores/auth";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import { useWebRTCStore } from "@/stores/webrtc";
import { computed, watch } from "vue";

function useScreenSharingAutoPin() {
  const authStore = useAuthStore();
  const mediaStore = useMediaStore();
  const roomStore = useRoomStore();
  const webRTCStore = useWebRTCStore();

  const activeScreenSharingUserIds = computed(() => {
    const ids: string[] = [];
    const userId = authStore.user?.id;

    if (userId && mediaStore.isSharingScreen) ids.push(userId);

    for (const [userId, remoteStream] of webRTCStore.remoteStreams.entries()) {
      if (!remoteStream.screenSharing?.active) continue;
      ids.push(userId);
    }

    return ids;
  });

  watch(
    activeScreenSharingUserIds,
    value => {
      const pinnedItems = roomStore.pinnedItems;
      if (!value.length || !pinnedItems) return;

      value.forEach(userId => {
        const isPinned = pinnedItems.some(
          item => item.type === "screenSharing" && item.userId === userId,
        );

        if (!isPinned) pinnedItems.push({ userId, type: "screenSharing" });
      });
    },
    { immediate: true, deep: true },
  );

  watch(
    activeScreenSharingUserIds,
    value => {
      if (!roomStore.pinnedItems?.length) return;
      const activeUserIdsSet = new Set(value);

      const nextPinnedItems = roomStore.pinnedItems.filter(item => {
        if (item.type !== "screenSharing") return true;
        return activeUserIdsSet.has(item.userId);
      });

      if (nextPinnedItems.length === roomStore.pinnedItems.length) {
        return;
      }

      roomStore.pinnedItems = nextPinnedItems;
    },
    { deep: true },
  );
}

export default useScreenSharingAutoPin;
