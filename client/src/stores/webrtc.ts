import socket from "@/utils/socket";
import {
  SocketEvents,
  SocketResponseEvents,
  type getZodIceValidation,
  type SchemaOfZodValidationFn,
} from "@speak-up/shared";
import { defineStore } from "pinia";
import { toast } from "vue-sonner";

export const useWebRTCStore = defineStore("webrtc", () => {
  // TODO: should handle PeerConnections array properly

  function bindEvents(): void {
    socket
      .off(SocketResponseEvents.SEND_SDP)
      .on(SocketResponseEvents.SEND_SDP, data => toast.error(data.error));

    socket
      .off(SocketResponseEvents.SEND_ICE)
      .on(SocketResponseEvents.SEND_ICE, data => toast.error(data.error));

    socket
      .off(SocketEvents.RECEIVED_SDP)
      .on(SocketEvents.RECEIVED_SDP, data => {
        // TODO: handle received SDP
      });

    socket
      .off(SocketEvents.RECEIVED_ICE)
      .on(SocketEvents.RECEIVED_ICE, data => {
        // TODO: handle received ice candidate
      });
  }

  function setLocalDescription(description: RTCSessionDescription): void {
    // TODO: set pc's localDescription
  }

  function setRemoteDescription(description: RTCSessionDescription): void {
    // TODO: set pc's remoteDescription
  }

  function sendOffer(userId: string): void {
    // TODO: create an offer (sdp) and set local description
    const sdp = "sdp";
    socket.emit(SocketEvents.SEND_SDP, { userId, sdp, type: "offer" });
  }

  function sendAnswer(userId: string): void {
    // TODO: create an answer (sdp) and set local description
    const sdp = "sdp";
    socket.emit(SocketEvents.SEND_SDP, { userId, sdp, type: "answer" });
  }

  function sendIce(userId: string): void {
    // TODO: called on "icecandidate" event?
    const ice: SchemaOfZodValidationFn<typeof getZodIceValidation> = {
      candidate: "candidate",
    } as const;

    socket.emit(SocketEvents.SEND_ICE, { userId, ice });
  }

  return {
    bindEvents,
    setLocalDescription,
    setRemoteDescription,
    sendOffer,
    sendAnswer,
    sendIce,
  };
});
