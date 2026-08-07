export const MediaDeviceEvents = {
  USER_MEDIA_STREAM: "userMediaStream",
  SCREEN_SHARING_STREAM: "screenSharingStream",
} as const;

export type MediaDeviceEventNames =
  (typeof MediaDeviceEvents)[keyof typeof MediaDeviceEvents];
