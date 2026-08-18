export const PeerConnectionEvents = {
  REMOTE_USER_MEDIA_STREAM: "remoteUserMediaStream",
  REMOTE_SCREEN_SHARING_STREAM: "remoteScreenSharingStream",
  SDP: "sdp",
  ICE: "ice",
} as const;

export interface SdpPayload {
  sdp: Required<RTCSessionDescriptionInit>;
  type: "offer" | "answer";
}

export interface IcePayload {
  ice: RTCIceCandidateInit;
}

export type PeerConnectionEventsValue =
  (typeof PeerConnectionEvents)[keyof typeof PeerConnectionEvents];
