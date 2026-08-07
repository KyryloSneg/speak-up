import type { VideoCodecMimeType } from "@/types/media";

export const DEFAULT_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: { ideal: 1 },
  sampleRate: { ideal: 48000 },
  latency: { ideal: 0.01 },
  googHighpassFilter: false,
  googAudioMirroring: false,
} as const;

export const DEFAULT_ASPECT_RATIO_W = 16;
export const DEFAULT_ASPECT_RATIO_H = 9;

export const DEFAULT_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  aspectRatio: { ideal: DEFAULT_ASPECT_RATIO_W / DEFAULT_ASPECT_RATIO_H },
  frameRate: { ideal: 30 },
  facingMode: "user",
} as const;

export const DEFAULT_SCREEN_SHARING_CONSTRAINTS: DisplayMediaStreamOptions = {
  video: {
    frameRate: { ideal: 15, max: 30 },
  },
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: { ideal: 2 },
  },
  selfBrowserSurface: "exclude",
  surfaceSwitching: "include",
  systemAudio: "include",
  suppressLocalAudioPlayback: "supress",
};

export const PREFERRED_VIDEO_CODECS: VideoCodecMimeType[] = [
  "video/VP9",
  "video/H264",
  "video/AV1",
  "video/VP8",
] as const;
