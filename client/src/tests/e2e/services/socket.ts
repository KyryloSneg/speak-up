import { mockRoomId } from "@/tests/e2e/utils/consts";
import { mockUser } from "@/tests/utils/consts";
import {
  SocketAuthConnectionErrorCode,
  SocketEvents,
  SocketResponseEvents,
  type SocketAuthConnectionError,
  type SocketClientToServerEvents,
  type SocketServerToClientEvents,
  type SocketServerToClientEventsData,
  type UserDto,
} from "@speak-up/shared";
import _ from "lodash";
import type { DefaultEventsMap, Socket } from "socket.io";
import { Server } from "socket.io";

type SocketData = { userId: UserDto["id"] };

export type IO = Server<SocketClientToServerEvents, SocketServerToClientEvents>;
export type IOSocket<IsAuth extends boolean = false> = Socket<
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  DefaultEventsMap,
  IsAuth extends true ? SocketData : Partial<SocketData>
>;

export type IOSocketNextFunction = (error?: Error) => void;

function socketAuthMiddlewareWithErrorHandling(
  socket: IOSocket,
  next: IOSocketNextFunction,
  options: { isConnectError?: boolean; isConnectAuthError?: boolean } = {
    isConnectError: false,
    isConnectAuthError: false,
  },
): void {
  try {
    if (options.isConnectError) throw new Error("Connect error");
    const accessToken =
      socket.handshake.auth.accessToken ||
      socket.handshake.headers?.["accesstoken"] ||
      socket.handshake.query?.["accessToken"];

    if (!accessToken || options.isConnectAuthError) {
      throw new Error("Auth error");
    }
    next();
  } catch (e) {
    const error = e as Error;
    const authError = {
      message: "Unexpected Error",
      data:
        error.message === "Auth error"
          ? { code: SocketAuthConnectionErrorCode }
          : undefined,
    } as Error | SocketAuthConnectionError;

    next(authError);
  }
}

export const defaultMockIoResponses: Partial<SocketServerToClientEventsData> = {
  [SocketEvents.USER_JOINED]: {
    user: {
      id: "thirdId",
      username: "thirdUsername",
      nickname: "third nickname",
      picture: "thirdPicture",
      letterPicture: "thirdLetterPicture",
    },
  },
  [SocketEvents.USER_LEFT]: { userId: "secId" },
  [SocketEvents.LEFT_ROOM]: { id: mockRoomId },
  [SocketEvents.RECEIVED_MEDIA_CONFIG]: {
    userId: "firstId",
    config: { audio: true, video: true },
  },
  [SocketEvents.RECEIVED_SDP]: {
    userId: "firstId",
    sdp: "sdp",
    type: "answer",
  },
  [SocketEvents.RECEIVED_ICE]: {
    userId: "firstId",
    ice: { candidate: "candidate", sdpMid: "sdpMid", sdpMLineIndex: 0 },
  },
  [SocketEvents.RECEIVED_MESSAGE]: {
    message: {
      id: "newFirstId",
      userId: "firstId",
      content: [{ type: "text", value: "new firstId msg" }],
    },
  },
  [SocketResponseEvents.CREATE_ROOM]: { id: mockRoomId },
  [SocketResponseEvents.JOIN_ROOM]: {
    users: [
      {
        id: "firstId",
        username: "firstUsername",
        nickname: "first nickname",
        picture: "firstPicture",
        letterPicture: "firstLetterPicture",
      },
      {
        id: "secId",
        username: "secUsername",
        nickname: "sec nickname",
        picture: "secPicture",
        letterPicture: "secLetterPicture",
      },
    ],
    messages: [
      {
        id: "id",
        userId: "firstId",
        content: [
          { type: "text", value: "value" },
          { type: "text", value: "smth" },
        ],
      },
    ],
  },
  [SocketResponseEvents.SEND_MESSAGE]: {
    message: {
      id: "newId",
      userId: mockUser.id,
      content: [{ type: "text", value: "new msg" }],
    },
  },
} as const;

export const mockIoErrorResponses: Partial<SocketServerToClientEventsData> = {
  [SocketResponseEvents.CREATE_ROOM]: { error: "You can't create a room" },
  [SocketResponseEvents.JOIN_ROOM]: { error: "You can't join this room" },
  [SocketResponseEvents.SEND_MEDIA_CONFIG]: {
    error: "You can't send a media config",
  },
  [SocketResponseEvents.SEND_SDP]: { error: "You can't send sdp" },
  [SocketResponseEvents.SEND_ICE]: { error: "You can't send ice" },
  [SocketResponseEvents.REMOVE_USER]: { error: "You can't remove a user" },
  [SocketResponseEvents.SEND_MESSAGE]: { error: "You can't send a message" },
} as const;

export function createMockSocketServer(port: number = 7000) {
  let isConnectError = false;
  let isConnectAuthError = false;

  let responses: Partial<SocketServerToClientEventsData> = _.cloneDeep(
    defaultMockIoResponses,
  );

  const apiUrlString = process.env.VITE_API_URL || "http://localhost:7000";
  const parsedUrl = new URL(apiUrlString);
  const customPath =
    parsedUrl.pathname !== "/"
      ? `${parsedUrl.pathname.replace(/\/$/, "")}/socket.io/`
      : undefined;

  const mockIo = new Server<
    SocketClientToServerEvents,
    SocketServerToClientEvents
  >({
    transports: ["websocket"],
    allowUpgrades: true,
    pingInterval: 10000,
    pingTimeout: 5000,
    maxHttpBufferSize: 1e6, // 1MB
    cors: {
      origin: "*",
      credentials: true,
    },
    serveClient: false,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
    ...(customPath && { path: customPath }),
  });

  function initSocket(socket: IOSocket<true>): void {
    function emitDataToClient<Event extends keyof SocketServerToClientEvents>(
      event: Event,
    ): void {
      const data = responses[event];
      if (!data) return;

      socket.emit(
        event,
        ...([data] as Parameters<SocketServerToClientEvents[Event]>),
      );
    }

    socket
      .on(SocketEvents.CREATE_ROOM, () =>
        emitDataToClient(SocketResponseEvents.CREATE_ROOM),
      )
      .on(SocketEvents.JOIN_ROOM, () =>
        emitDataToClient(SocketResponseEvents.JOIN_ROOM),
      )
      .on(SocketEvents.SEND_MEDIA_CONFIG, () =>
        emitDataToClient(SocketResponseEvents.SEND_MEDIA_CONFIG),
      )
      .on(SocketEvents.SEND_SDP, () =>
        emitDataToClient(SocketResponseEvents.SEND_SDP),
      )
      .on(SocketEvents.SEND_ICE, () =>
        emitDataToClient(SocketResponseEvents.SEND_ICE),
      )
      .on(SocketEvents.REMOVE_USER, () =>
        emitDataToClient(SocketResponseEvents.REMOVE_USER),
      )
      .on(SocketEvents.LEAVE_ROOM, () =>
        emitDataToClient(SocketResponseEvents.LEAVE_ROOM),
      )
      .on(SocketEvents.SEND_MESSAGE, () =>
        emitDataToClient(SocketResponseEvents.SEND_MESSAGE),
      );
  }

  mockIo
    .use((socket, next) =>
      socketAuthMiddlewareWithErrorHandling(socket, next, {
        isConnectError,
        isConnectAuthError,
      }),
    )
    .on(SocketEvents.CONNECTION, socket =>
      initSocket(socket as IOSocket<true>),
    );

  return {
    server: mockIo,
    getResponses: () => responses,
    setResponses: (newResponses: Partial<SocketServerToClientEventsData>) => {
      responses = { ...responses, ...newResponses };
    },
    reset: () => {
      isConnectError = false;
      isConnectAuthError = false;

      responses = _.cloneDeep(defaultMockIoResponses);
    },
    setIsConnectError: (value: boolean) => {
      isConnectError = value;
    },
    setIsConnectAuthError: (value: boolean) => {
      isConnectAuthError = value;
    },
    listen: () => {
      mockIo.listen(port);
    },
    close: (): Promise<void> => {
      return new Promise(resolve => mockIo.close(() => resolve()));
    },
  };
}
