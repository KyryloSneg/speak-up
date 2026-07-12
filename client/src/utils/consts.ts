import type { VideoCodecMimeType } from "@/types/media";

export const DEFAULT_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
};

export const DEFAULT_ASPECT_RATIO_W = 16;
export const DEFAULT_ASPECT_RATIO_H = 9;

export const DEFAULT_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  aspectRatio: DEFAULT_ASPECT_RATIO_W / DEFAULT_ASPECT_RATIO_H,
  facingMode: "user",
};

export const PREFERRED_VIDEO_CODECS: VideoCodecMimeType[] = [
  "video/H264",
  "video/VP8",
  "video/VP9",
];

export const roomChatId = "room-chat";
export const memberListId = "member-list";
