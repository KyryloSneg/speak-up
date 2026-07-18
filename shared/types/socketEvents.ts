import type {
  getZodCreateRoomDataValidation,
  getZodIceValidation,
  getZodJoinRoomDataValidation,
  getZodRemoveUserDataValidation,
  getZodSendIceDataValidation,
  getZodSendMediaConfigDataValidation,
  getZodSendMessageDataValidation,
  getZodSendSDPDataValidation,
  SchemaOfZodValidationFn,
} from "../utils/validation.ts";
import type { Message } from "./message.ts";
import type { SocketMediaConfig } from "./socketMediaConfig.ts";
import type { UserDto } from "./user.ts";

export const SocketEvents = {
  CONNECTION: "connection",
  CONNECT: "connect",
  CONNECT_ERROR: "connect_error",
  CREATE_ROOM: "createRoom",
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  USER_JOINED: "userJoined",
  USER_LEFT: "userLeft",
  LEFT_ROOM: "leftRoom",
  SEND_MEDIA_CONFIG: "sendMediaConfig",
  RECEIVED_MEDIA_CONFIG: "receivedMediaConfig",
  SEND_SDP: "sendSDP",
  RECEIVED_SDP: "receivedSDP",
  SEND_ICE: "sendIce",
  RECEIVED_ICE: "receivedIce",
  REMOVE_USER: "removeUser",
  SEND_MESSAGE: "sendMessage",
  RECEIVED_MESSAGE: "receivedMessage",
  CHANGED_NICKNAME: "changedNickname",
  DISCONNECTING: "disconnecting",
  DISCONNECT: "disconnect",
} as const;

export const SocketResponseEvents = {
  CREATE_ROOM: "createRoom:response",
  JOIN_ROOM: "joinRoom:response",
  LEAVE_ROOM: "leaveRoom:response",
  SEND_MEDIA_CONFIG: "sendMediaConfig:response",
  SEND_SDP: "sendSDP:response",
  SEND_ICE: "sendIce:response",
  REMOVE_USER: "removeUser:response",
  SEND_MESSAGE: "sendMessage:response",
} as const;

export type SocketEventsKey = keyof typeof SocketEvents;
export type SocketResponseEventsKey = keyof typeof SocketResponseEvents;

export type SocketEventsValue =
  (typeof SocketEvents)[keyof typeof SocketEvents];
export type SocketResponseEventsValue =
  (typeof SocketResponseEvents)[keyof typeof SocketResponseEvents];

export interface SocketResponseError {
  error: string;
}

export interface SocketClientToServerEvents {
  [SocketEvents.CREATE_ROOM]: (
    data: SchemaOfZodValidationFn<typeof getZodCreateRoomDataValidation>,
  ) => void;
  [SocketEvents.JOIN_ROOM]: (
    data: SchemaOfZodValidationFn<typeof getZodJoinRoomDataValidation>,
  ) => void;
  [SocketEvents.LEAVE_ROOM]: () => void;
  [SocketEvents.SEND_MEDIA_CONFIG]: (
    data: SchemaOfZodValidationFn<typeof getZodSendMediaConfigDataValidation>,
  ) => void;
  [SocketEvents.SEND_SDP]: (
    data: SchemaOfZodValidationFn<typeof getZodSendSDPDataValidation>,
  ) => void;
  [SocketEvents.SEND_ICE]: (
    data: SchemaOfZodValidationFn<typeof getZodSendIceDataValidation>,
  ) => void;
  [SocketEvents.REMOVE_USER]: (
    data: SchemaOfZodValidationFn<typeof getZodRemoveUserDataValidation>,
  ) => void;
  [SocketEvents.SEND_MESSAGE]: (
    data: SchemaOfZodValidationFn<typeof getZodSendMessageDataValidation>,
  ) => void;
}

export interface SocketServerToClientEvents {
  [SocketEvents.USER_JOINED]: (data: { user: UserDto }) => void;
  [SocketEvents.USER_LEFT]: (data: { userId: string }) => void;
  [SocketEvents.LEFT_ROOM]: (data: { id: string }) => void;
  [SocketEvents.RECEIVED_MEDIA_CONFIG]: (data: {
    userId: string;
    config: SocketMediaConfig;
  }) => void;
  [SocketEvents.RECEIVED_SDP]: (data: {
    userId: string;
    sdp: string;
    type: "offer" | "answer";
  }) => void;
  [SocketEvents.RECEIVED_ICE]: (data: {
    userId: string;
    ice: SchemaOfZodValidationFn<typeof getZodIceValidation>;
  }) => void;
  [SocketEvents.RECEIVED_MESSAGE]: (data: { message: Message }) => void;
  [SocketEvents.CHANGED_NICKNAME]: (data: {
    userId: string;
    nickname: string;
    picture?: string;
    letterPicture?: string;
  }) => void;
  [SocketResponseEvents.CREATE_ROOM]: (
    data: { id: string } | SocketResponseError,
  ) => void;
  [SocketResponseEvents.JOIN_ROOM]: (
    data: { users: UserDto[]; messages: Message[] } | SocketResponseError,
  ) => void;
  [SocketResponseEvents.LEAVE_ROOM]: (data: SocketResponseError) => void;
  [SocketResponseEvents.SEND_MEDIA_CONFIG]: (data: SocketResponseError) => void;
  [SocketResponseEvents.SEND_ICE]: (data: SocketResponseError) => void;
  [SocketResponseEvents.SEND_SDP]: (data: SocketResponseError) => void;
  [SocketResponseEvents.REMOVE_USER]: (data: SocketResponseError) => void;
  [SocketResponseEvents.SEND_MESSAGE]: (
    data: { message: Message } | (SocketResponseError & { tempId?: string }),
  ) => void;
}

type ExtractDataFromSocketEvents<Events> = {
  [K in keyof Events]: Events[K] extends (...args: any[]) => any
    ? Parameters<Events[K]>[0]
    : never;
};

export type SocketClientToServerEventsData =
  ExtractDataFromSocketEvents<SocketClientToServerEvents>;

export type SocketServerToClientEventsData =
  ExtractDataFromSocketEvents<SocketServerToClientEvents>;

export interface SocketAuthConnectionError extends Error {
  data?: {
    code: string;
  };
}

export const SocketAuthConnectionErrorCode = "authError";
