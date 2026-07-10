import type { SocketMediaConfig } from "@speak-up/shared";

export type RoomMediaConfigUserId = string & {
  readonly __brand: "RoomMediaConfigUserId";
};

export interface RoomMediaConfig extends SocketMediaConfig {
  userId: RoomMediaConfigUserId;
}

export type RoomMediaConfigs = Map<RoomMediaConfigUserId, RoomMediaConfig>;

export type VideoCodecMimeType =
  | "video/H264"
  | "video/VP8"
  | "video/VP9"
  | "video/AV1";

export const FacingModes = {
  USER: "user",
  ENVIRONMENT: "environment",
} as const;

export type FacingMode = (typeof FacingModes)[keyof typeof FacingModes];
