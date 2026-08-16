import type { UIScrollbarTemplateRef } from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import useChatIsScrollDownButton from "@/composables/useChatIsScrollDownButton";
import { useChatStore } from "@/stores/chat";
import { useRoomStore } from "@/stores/room";
import type { Room } from "@/types/room";
import type { Message } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("useChatIsScrollDownButton", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function createMockViewport(options: {
    scrollHeight: number;
    scrollTop: number;
    clientHeight: number;
  }): HTMLElement {
    const elem = document.createElement("div");

    Object.defineProperty(elem, "scrollHeight", {
      value: options.scrollHeight,
      configurable: true,
    });

    Object.defineProperty(elem, "scrollTop", {
      value: options.scrollTop,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(elem, "clientHeight", {
      value: options.clientHeight,
      configurable: true,
    });

    return elem;
  }

  it("should do nothing and preserve scrolledPx if viewport element is undefined", async () => {
    const chatStore = useChatStore();
    const roomStore = useRoomStore();

    chatStore.scrollTemplateRef = null;
    chatStore.scrolledPx = 0;

    useChatIsScrollDownButton();

    roomStore.room = {
      id: "room-1",
      messages: [{ id: "msg-1" } as Message],
    } as Room;

    await nextTick();
    expect(chatStore.scrolledPx).toBe(0);
  });

  describe("scroll event listener", () => {
    it("should calculate and set scrolledPx when viewport fires a scroll event", () => {
      const chatStore = useChatStore();
      const viewport = createMockViewport({
        scrollHeight: 1000,
        scrollTop: 300,
        clientHeight: 400,
      });

      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;

      useChatIsScrollDownButton();
      viewport.dispatchEvent(new Event("scroll"));

      expect(chatStore.scrolledPx).toBe(300);
    });

    it("should set scrolledPx to 0 when scrolled to the very bottom", () => {
      const chatStore = useChatStore();
      const viewport = createMockViewport({
        scrollHeight: 1000,
        scrollTop: 600,
        clientHeight: 400,
      });

      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;

      useChatIsScrollDownButton();
      viewport.dispatchEvent(new Event("scroll"));

      expect(chatStore.scrolledPx).toBe(0);
    });

    it("should reactively bind listener if scrollTemplateRef is set after composable initialization", async () => {
      const chatStore = useChatStore();
      useChatIsScrollDownButton();

      const viewport = createMockViewport({
        scrollHeight: 1200,
        scrollTop: 200,
        clientHeight: 500,
      });

      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;
      await nextTick();

      viewport.dispatchEvent(new Event("scroll"));
      expect(chatStore.scrolledPx).toBe(500);
    });
  });

  describe("messages length watcher", () => {
    it("should recalculate scrolledPx when message count in room changes", async () => {
      const chatStore = useChatStore();
      const roomStore = useRoomStore();

      const viewport = createMockViewport({
        scrollHeight: 1500,
        scrollTop: 400,
        clientHeight: 600,
      });

      roomStore.room = {
        id: "room-1",
        messages: [{ id: "msg-1" } as Message],
      } as Room;

      await nextTick();
      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;

      useChatIsScrollDownButton();
      roomStore.room.messages = [
        ...roomStore.room.messages,
        { id: "msg-2" } as Message,
      ];

      await nextTick();
      expect(chatStore.scrolledPx).toBe(500);
    });
  });
});
