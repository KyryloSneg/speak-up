import PeerConnection from "@/services/PeerConnection";
import { useMediaStore } from "@/stores/media";
import {
  PeerConnectionEvents,
  type IcePayload,
  type SdpPayload,
} from "@/types/webrtc";
import checkIsPCPolite from "@/utils/checkIsPCPolite";
import socket from "@/utils/socket";
import {
  getZodIceValidation,
  SocketEvents,
  SocketResponseEvents,
  type UserDto,
} from "@speak-up/shared";
import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import { toast } from "vue-sonner";

export interface RemoteStreams {
  userMedia: MediaStream | null;
  screenSharing: MediaStream | null;
}

export const useWebRTCStore = defineStore("webrtc", () => {
  const peerConnections = shallowRef<Map<string, PeerConnection>>(new Map());
  const remoteStreams = ref<Map<string, RemoteStreams>>(new Map());

  const sharingScreenAnnouncerText = ref("");

  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.SEND_SDP)
      .on(SocketResponseEvents.SEND_SDP, data => toast.error(data.error));

    socket
      .off(SocketResponseEvents.SEND_ICE)
      .on(SocketResponseEvents.SEND_ICE, data => toast.error(data.error));

    socket
      .off(SocketEvents.RECEIVED_SDP)
      .on(SocketEvents.RECEIVED_SDP, async data => {
        const pc = createPeerConnection(data.userId);
        if (data.screenSharingStreamId !== undefined) {
          pc.remoteScreenSharingStreamId = data.screenSharingStreamId;
        }

        await pc.setRemoteDescription({
          type: data.type,
          sdp: data.sdp,
        });
      });

    socket
      .off(SocketEvents.RECEIVED_ICE)
      .on(SocketEvents.RECEIVED_ICE, async data => {
        const pc = createPeerConnection(data.userId);
        await pc.addIceCandidate(data.ice);
      });
  }

  function createPeerConnection(remoteId: UserDto["id"]): PeerConnection {
    let pc = peerConnections.value.get(remoteId);
    if (pc) return pc;

    pc = new PeerConnection(remoteId, checkIsPCPolite(remoteId), {
      onError: info => toast.error(info.message),
    });

    remoteStreams.value.set(remoteId, {
      userMedia: null,
      screenSharing: null,
    });

    pc.on(PeerConnectionEvents.SDP, payload => {
      const { sdp, type } = payload as SdpPayload;

      socket.emit(SocketEvents.SEND_SDP, {
        userId: remoteId,
        sdp: sdp.sdp,
        type,
        screenSharingStreamId: pc.localScreenSharingStreamId,
      });
    });

    pc.on(PeerConnectionEvents.ICE, payload => {
      const { ice } = payload as IcePayload;
      delete ice.usernameFragment;

      const validation = getZodIceValidation().safeParse(ice);
      if (validation.success) {
        socket.emit(SocketEvents.SEND_ICE, {
          userId: remoteId,
          ice: validation.data,
        });
      }
    });

    pc.on(PeerConnectionEvents.REMOTE_USER_MEDIA_STREAM, stream => {
      const current = remoteStreams.value.get(remoteId) || {
        userMedia: null,
        screenSharing: null,
      };

      remoteStreams.value.set(remoteId, {
        ...current,
        userMedia: stream as MediaStream | null,
      });
    });

    pc.on(PeerConnectionEvents.REMOTE_SCREEN_SHARING_STREAM, stream => {
      const current = remoteStreams.value.get(remoteId) || {
        userMedia: null,
        screenSharing: null,
      };

      remoteStreams.value.set(remoteId, {
        ...current,
        screenSharing: stream as MediaStream | null,
      });
    });

    pc.start();
    peerConnections.value.set(remoteId, pc);

    const mediaStore = useMediaStore();
    if (mediaStore.userMediaStream) {
      pc.localUserMediaStreamEventHandler(mediaStore.userMediaStream);
    }

    if (mediaStore.screenSharingStream) {
      pc.localScreenSharingStreamEventHandler(mediaStore.screenSharingStream);
    }

    return pc;
  }

  function removePeerConnection(remoteId: string): void {
    const pc = peerConnections.value.get(remoteId);

    if (pc) {
      pc.stop();
      peerConnections.value.delete(remoteId);
    }

    remoteStreams.value.delete(remoteId);
  }

  function sendUserMedia(stream: MediaStream | null): void {
    peerConnections.value.forEach(pc =>
      pc.localUserMediaStreamEventHandler(stream),
    );
  }

  function sendScreenSharing(stream: MediaStream | null): void {
    peerConnections.value.forEach(pc =>
      pc.localScreenSharingStreamEventHandler(stream),
    );
  }

  function stop(): void {
    peerConnections.value.forEach(pc => removePeerConnection(pc.remoteId));
    sharingScreenAnnouncerText.value = "";
  }

  return {
    peerConnections,
    remoteStreams,
    sharingScreenAnnouncerText,
    bindEvents,
    createPeerConnection,
    removePeerConnection,
    sendUserMedia,
    sendScreenSharing,
    stop,
  };
});
