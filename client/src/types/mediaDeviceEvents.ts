export const MediaDeviceEvents = {
  USER_MEDIA_STREAM: "userMediaStream",
} as const;

export type MediaDeviceEventNames =
  (typeof MediaDeviceEvents)[keyof typeof MediaDeviceEvents];
