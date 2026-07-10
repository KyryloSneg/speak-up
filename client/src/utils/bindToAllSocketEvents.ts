import { useHostStore } from "@/stores/host";
import { useMediaStore } from "@/stores/media";
import { useMessageStore } from "@/stores/message";
import { useRoomStore } from "@/stores/room";
import { useSocketStore } from "@/stores/socket";
import { useWebRTCStore } from "@/stores/webrtc";
import socket from "@/utils/socket";

function bindToAllSocketEvents(): void {
  const socketStore = useSocketStore();
  const roomStore = useRoomStore();
  const mediaStore = useMediaStore();
  const messageStore = useMessageStore();
  const hostStore = useHostStore();
  const webRTCStore = useWebRTCStore();

  // remove any existing listeners (after a hmr)
  socket.off();

  socketStore.bindEvents();
  roomStore.bindEvents();
  mediaStore.bindEvents();
  messageStore.bindEvents();
  hostStore.bindEvents();
  webRTCStore.bindEvents();
}

export default bindToAllSocketEvents;
