import { useRoomStore } from "@/stores/room";
import { useWebRTCStore } from "@/stores/webrtc";
import { computed, watch } from "vue";

function useSyncSharingScreenAnnouncerText() {
  const roomStore = useRoomStore();
  const webRTCStore = useWebRTCStore();

  const userIdsSharingScreen = computed(() => {
    const result: string[] = [];

    for (const [userId, remoteStream] of webRTCStore.remoteStreams.entries()) {
      if (!remoteStream.screenSharing?.active) continue;
      result.push(userId);
    }

    return result;
  });

  watch(userIdsSharingScreen, (value, oldValue) => {
    const newUserIdSharingScreen = oldValue
      ? value.find(userId => !oldValue.includes(userId))
      : value[0];

    if (!newUserIdSharingScreen) return;
    const user = roomStore.room?.users.find(
      user => user.id === newUserIdSharingScreen,
    );

    if (!user) return;
    webRTCStore.sharingScreenAnnouncerText = `User "${user.nickname}" shares their screen`;
  });
}

export default useSyncSharingScreenAnnouncerText;
