import { useAuthStore } from "@/stores/auth";
import { useMessageStore } from "@/stores/message";
import { useRoomStore } from "@/stores/room";
import mockSocket from "@/tests/unit/utils/mockSocket";
import { mockUser } from "@/tests/utils/consts";
import type { Room } from "@/types/room";
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
  type MessageContent,
} from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

let nanoidCounter = 0;

vi.mock("nanoid", () => ({
  nanoid: () => `mock-nanoid-${++nanoidCounter}`,
}));

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));

describe("messageStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    mockSocket.resetMock();
    nanoidCounter = 0;

    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("bindEvents", () => {
    describe("send message event", () => {
      it("should properly update optimistic message when SEND_MESSAGE response succeeds", async () => {
        const roomStore = useRoomStore();
        const messageStore = useMessageStore();

        const optimisticMessage = {
          id: "mock-nanoid-1",
          tempId: "mock-nanoid-1",
          userId: mockUser.id,
          user: {
            nickname: mockUser.nickname,
            picture: mockUser.picture,
          },
          content: [{ type: "text", value: "hello" }],
          createdAt: "2026-08-14T00:00:00.000Z",
        } as Message;

        roomStore.room = {
          id: "room-id",
          messages: [optimisticMessage],
        } as unknown as Room;

        messageStore.bindEvents();
        messageStore.bindEvents();

        const serverConfirmedMessage: Message = {
          id: "real-message-id",
          tempId: "mock-nanoid-1",
          userId: mockUser.id,
          user: {
            nickname: mockUser.nickname,
            picture: mockUser.picture,
          },
          content: [{ type: "text", value: "hello" }],
          createdAt: "2026-08-14T10:00:00.000Z",
        } as const;

        await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_MESSAGE, {
          message: serverConfirmedMessage,
        });

        expect(roomStore.room.messages[0]).toStrictEqual({
          id: "real-message-id",
          userId: mockUser.id,
          user: {
            nickname: mockUser.nickname,
            picture: mockUser.picture,
          },
          content: [{ type: "text", value: "hello" }],
          createdAt: "2026-08-14T10:00:00.000Z",
        });

        expect(roomStore.room.messages[0]?.tempId).toBeUndefined();
      });

      it("should properly handle error send message event with tempId by removing optimistic message", async () => {
        const roomStore = useRoomStore();
        const messageStore = useMessageStore();
        const error = "Message content invalid";

        const optimisticMessage = {
          id: "mock-nanoid-1",
          tempId: "mock-nanoid-1",
          userId: mockUser.id,
          user: { nickname: mockUser.nickname, picture: mockUser.picture },
          content: [{ type: "text", value: "bad text" }],
          createdAt: "2026-08-14T00:00:00.000Z",
        } as Message;

        roomStore.room = {
          id: "room-id",
          messages: [optimisticMessage],
        } as unknown as Room;

        messageStore.bindEvents();
        messageStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_MESSAGE, {
          error,
          tempId: "mock-nanoid-1",
        });

        expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
        expect(roomStore.room.messages).toStrictEqual([]);
      });

      it("should properly handle error send message event without tempId", async () => {
        const roomStore = useRoomStore();
        const messageStore = useMessageStore();
        const error = "General Socket Error";

        roomStore.room = {
          id: "room-id",
          messages: [],
        } as unknown as Room;

        messageStore.bindEvents();
        messageStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_MESSAGE, {
          error,
        });

        expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
      });

      it("should ignore send message event if user is not in a room", async () => {
        const messageStore = useMessageStore();

        messageStore.bindEvents();
        messageStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_MESSAGE, {
          error: "Error",
        });

        expect(toast.error).toHaveBeenCalledWith("Error");
      });
    });

    describe("received message event", () => {
      it("should properly listen to received message event and push new message", async () => {
        const roomStore = useRoomStore();
        const messageStore = useMessageStore();

        const receivedMessage: Message = {
          id: "msg-1",
          userId: "another-user",
          user: { nickname: "AnotherUser", picture: "picture.png" },
          content: [{ type: "text", value: "hello world" }],
          createdAt: new Date().toISOString(),
        } as const;

        roomStore.room = { id: "room-id", messages: [] } as unknown as Room;

        messageStore.bindEvents();
        messageStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.RECEIVED_MESSAGE, {
          message: receivedMessage,
        });

        expect(roomStore.room.messages).toStrictEqual([receivedMessage]);
      });

      it("should ignore duplicate received message if it already exists in room messages", async () => {
        const roomStore = useRoomStore();
        const messageStore = useMessageStore();

        const existingMessage: Message = {
          id: "msg-1",
          userId: "another-user",
          user: { nickname: "AnotherUser", picture: "picture.png" },
          content: [{ type: "text", value: "hello world" }],
          createdAt: new Date().toISOString(),
        } as const;

        roomStore.room = {
          id: "room-id",
          messages: [existingMessage],
        } as unknown as Room;

        messageStore.bindEvents();
        messageStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketEvents.RECEIVED_MESSAGE, {
          message: existingMessage,
        });

        expect(roomStore.room.messages).toStrictEqual([existingMessage]);
      });

      it("should ignore received message event if user is not in a room", async () => {
        const roomStore = useRoomStore();
        const messageStore = useMessageStore();

        roomStore.room = null;

        messageStore.bindEvents();
        messageStore.bindEvents();

        const message: Message = {
          id: "msg-1",
          userId: "another-user",
          user: { nickname: "AnotherUser", picture: "picture.png" },
          content: [{ type: "text", value: "hello" }],
          createdAt: new Date().toISOString(),
        } as const;

        await mockSocket.triggerServerEvent(SocketEvents.RECEIVED_MESSAGE, {
          message,
        });

        expect(roomStore.room).toBeNull();
      });
    });
  });

  describe("sendMessage", () => {
    it("should ignore sending message if user is not authenticated", () => {
      const authStore = useAuthStore();
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      authStore.user = null;
      roomStore.room = { id: "room-id", messages: [] } as unknown as Room;

      const content: MessageContent = [{ type: "text", value: "test" }];
      messageStore.sendMessage(content);

      expect(roomStore.room.messages).toStrictEqual([]);
      vi.advanceTimersByTime(150);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it("should ignore sending message if room is null", () => {
      const authStore = useAuthStore();
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      authStore.user = mockUser;
      roomStore.room = null;

      const content: MessageContent = [{ type: "text", value: "test" }];
      messageStore.sendMessage(content);

      vi.advanceTimersByTime(150);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it("should push optimistic message immediately and emit debounced socket event", () => {
      const authStore = useAuthStore();
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      authStore.user = mockUser;
      roomStore.room = { id: "room-id", messages: [] } as unknown as Room;

      const content: MessageContent = [{ type: "text", value: "hello" }];
      messageStore.sendMessage(content);

      expect(roomStore.room.messages).toHaveLength(1);
      expect(roomStore.room.messages[0]).toStrictEqual({
        id: "mock-nanoid-1",
        tempId: "mock-nanoid-1",
        userId: mockUser.id,
        user: {
          nickname: mockUser.nickname,
          picture: mockUser.picture,
        },
        content,
        createdAt: expect.any(String),
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();

      vi.advanceTimersByTime(150);

      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.SEND_MESSAGE,
        [
          {
            tempId: "mock-nanoid-1",
            content,
          },
        ],
      );
    });

    it("should batch multiple rapid message emissions into a single socket payload", () => {
      const authStore = useAuthStore();
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      authStore.user = mockUser;
      roomStore.room = { id: "room-id", messages: [] } as unknown as Room;

      const content1: MessageContent = [{ type: "text", value: "first" }];
      const content2: MessageContent = [{ type: "text", value: "second" }];

      messageStore.sendMessage(content1);
      messageStore.sendMessage(content2);

      expect(roomStore.room.messages).toHaveLength(2);

      vi.advanceTimersByTime(150);

      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.SEND_MESSAGE,
        [
          { tempId: "mock-nanoid-1", content: content1 },
          { tempId: "mock-nanoid-2", content: content2 },
        ],
      );
    });
  });

  describe("messageGroups", () => {
    it("should return null if room is null", () => {
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      roomStore.room = null;
      expect(messageStore.messageGroups).toBeNull();
    });

    it("should return empty array if room messages array is empty", () => {
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      roomStore.room = { id: "room-id", messages: [] } as unknown as Room;
      expect(messageStore.messageGroups).toStrictEqual([]);
    });

    it("should correctly group consecutive messages by the same user", () => {
      const roomStore = useRoomStore();
      const messageStore = useMessageStore();

      const user1 = { id: "u1", nickname: "User 1", picture: "pic1.png" };
      const user2 = { id: "u2", nickname: "User 2", picture: "pic2.png" };

      const msg1 = {
        id: "msg-1",
        userId: user1.id,
        user: { nickname: user1.nickname, picture: user1.picture },
        content: [{ type: "text", value: "hi" }],
        createdAt: "2026-08-14T10:00:00Z",
      } as Message;

      const msg2 = {
        id: "msg-2",
        userId: user1.id,
        user: { nickname: user1.nickname, picture: user1.picture },
        content: [{ type: "text", value: "how are you?" }],
        createdAt: "2026-08-14T10:01:00Z",
      } as Message;

      const msg3 = {
        id: "msg-3",
        userId: user2.id,
        user: { nickname: user2.nickname, picture: user2.picture },
        content: [{ type: "text", value: "hey!" }],
        createdAt: "2026-08-14T10:02:00Z",
      } as Message;

      const msg4 = {
        id: "msg-4",
        userId: user1.id,
        user: { nickname: user1.nickname, picture: user1.picture },
        content: [{ type: "text", value: "all good!" }],
        createdAt: "2026-08-14T10:03:00Z",
      } as Message;

      roomStore.room = {
        id: "room-id",
        messages: [msg1, msg2, msg3, msg4],
      } as unknown as Room;

      expect(messageStore.messageGroups).toStrictEqual([
        {
          id: "group-mock-nanoid-1",
          userId: user1.id,
          nickname: user1.nickname,
          picture: user1.picture,
          messages: [msg1, msg2],
        },
        {
          id: "group-mock-nanoid-2",
          userId: user2.id,
          nickname: user2.nickname,
          picture: user2.picture,
          messages: [msg3],
        },
        {
          id: "group-mock-nanoid-3",
          userId: user1.id,
          nickname: user1.nickname,
          picture: user1.picture,
          messages: [msg4],
        },
      ]);
    });
  });
});
