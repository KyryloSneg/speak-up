import { useMessageStore } from "@/stores/message";
import { useRoomStore } from "@/stores/room";
import mockSocket from "@/tests/unit/utils/mockSocket";
import type { Room } from "@/types/room";
import {
  SocketEvents,
  SocketResponseEvents,
  type Message,
  type MessageContent,
} from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));

describe("messageStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    mockSocket.resetMock();
    vi.clearAllMocks();
  });

  describe("bindEvents", () => {
    async function testSuccessfulMessageEvent(event: string): Promise<void> {
      const messageStore = useMessageStore();
      const roomStore = useRoomStore();

      const message: Message = {
        id: "id",
        userId: "userId",
        content: [{ type: "text", value: "value" }],
      } as const;

      roomStore.room = { id: "id", messages: [] } as unknown as Room;

      messageStore.bindEvents();
      messageStore.bindEvents();

      await mockSocket.triggerServerEvent(event, { message });
      expect(roomStore.room.messages).toStrictEqual([message]);
    }

    describe("send message event", () => {
      it("should properly listen to send message event", async () =>
        await testSuccessfulMessageEvent(SocketResponseEvents.SEND_MESSAGE));

      it("should properly handle an error send message event", async () => {
        const messageStore = useMessageStore();
        const error = "Unexpected Error";

        messageStore.bindEvents();
        messageStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.SEND_MESSAGE, {
          error,
        });

        expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
      });
    });

    describe("received message event", () => {
      it("should properly listen to received message event", async () =>
        await testSuccessfulMessageEvent(SocketEvents.RECEIVED_MESSAGE));
    });
  });

  describe("sendMessage", () => {
    it("should properly emit send message event", () => {
      const messageStore = useMessageStore();
      const content: MessageContent = [{ type: "text", value: "value" }];

      messageStore.sendMessage(content);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.SEND_MESSAGE,
        { content },
      );
    });
  });
});
