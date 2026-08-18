import useNewMessages from "@/composables/useNewMessages";
import { useRoomStore } from "@/stores/room";
import type { Room } from "@/types/room";
import type { Message } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, ref } from "vue";

describe("useNewMessages", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should return an empty array initially when room is null or empty", () => {
    const roomStore = useRoomStore();
    roomStore.room = null;

    const newMessages = useNewMessages();
    expect(newMessages.value).toEqual([]);
  });

  describe("same room message updates", () => {
    it("should detect and append new messages added to the room", async () => {
      const roomStore = useRoomStore();
      const msg1 = {
        id: "msg-1",
        content: [{ type: "text", value: "First" }],
      } as Message;

      const msg2 = {
        id: "msg-2",
        content: [{ type: "text", value: "Second" }],
      } as Message;

      roomStore.room = { id: "room-1", messages: [msg1] } as Room;

      const newMessages = useNewMessages();
      await nextTick();

      expect(newMessages.value).toEqual([]);

      roomStore.room!.messages = [msg1, msg2];
      await nextTick();

      expect(newMessages.value).toEqual([msg2]);
    });

    it("should handle optimistic messages with tempId", async () => {
      const roomStore = useRoomStore();
      const msg1 = {
        id: "msg-1",
        content: [{ type: "text", value: "Confirmed" }],
      } as Message;

      const msg2 = {
        id: "msg-2",
        tempId: "msg-123",
        content: [{ type: "text", value: "Sending.." }],
      } as Message;

      roomStore.room = { id: "room-1", messages: [msg1] } as Room;

      const newMessages = useNewMessages();
      await nextTick();

      roomStore.room!.messages = [msg1, msg2];
      await nextTick();

      expect(newMessages.value).toEqual([msg2]);
    });

    it("should not return new messages if updated message count is less than or equal to old count", async () => {
      const roomStore = useRoomStore();
      const msg1 = {
        id: "msg-1",
        content: [{ type: "text", value: "First" }],
      } as Message;

      const msg2 = {
        id: "msg-1",
        content: [{ type: "text", value: "Second" }],
      } as Message;

      roomStore.room = { id: "room-1", messages: [msg1, msg2] } as Room;

      const newMessages = useNewMessages();
      await nextTick();

      roomStore.room!.messages = [msg1];
      await nextTick();

      expect(newMessages.value).toEqual([]);
    });
  });

  describe("room switching", () => {
    it("should treat all messages as new when switching to a different room", async () => {
      const roomStore = useRoomStore();
      const room1Msg = {
        id: "room1-msg-1",
        content: [{ type: "text", value: "Room 1 text" }],
      } as Message;

      const room2Msg1 = {
        id: "room2-msg-1",
        content: [{ type: "text", value: "Room 2 text 1" }],
      } as Message;

      const room2Msg2 = {
        id: "room2-msg-1",
        content: [{ type: "text", value: "Room 2 text 1" }],
      } as Message;

      roomStore.room = { id: "room-1", messages: [room1Msg] } as Room;

      const newMessages = useNewMessages();
      await nextTick();

      roomStore.room = {
        id: "room-2",
        messages: [room2Msg1, room2Msg2],
      } as Room;
      await nextTick();

      expect(newMessages.value).toEqual([room2Msg1, room2Msg2]);
    });
  });

  describe("isToCleanup watcher and guard", () => {
    it("should clear accumulated new messages when isToCleanup becomes true", async () => {
      const roomStore = useRoomStore();
      const msg1 = {
        id: "msg-1",
        content: [{ type: "text", value: "First" }],
      } as Message;

      const msg2 = {
        id: "msg-2",
        content: [{ type: "text", value: "Second" }],
      } as Message;

      roomStore.room = { id: "room-1", messages: [msg1] } as Room;

      const isToCleanup = ref(false);
      const newMessages = useNewMessages(isToCleanup);
      await nextTick();

      roomStore.room!.messages = [msg1, msg2];
      await nextTick();

      expect(newMessages.value).toEqual([msg2]);

      isToCleanup.value = true;
      await nextTick();

      expect(newMessages.value).toEqual([]);
    });

    it("should ignore new messages while isToCleanup is true", async () => {
      const roomStore = useRoomStore();
      const msg1 = {
        id: "msg-1",
        content: [{ type: "text", value: "First" }],
      } as Message;

      const msg2 = {
        id: "msg-2",
        content: [{ type: "text", value: "Second" }],
      } as Message;

      roomStore.room = { id: "room-1", messages: [msg1] } as Room;

      const isToCleanup = ref(true);
      const newMessages = useNewMessages(isToCleanup);
      await nextTick();

      roomStore.room!.messages = [msg1, msg2];
      await nextTick();

      expect(newMessages.value).toEqual([]);
    });
  });
});
