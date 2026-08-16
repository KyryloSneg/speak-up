import type { UIScrollbarTemplateRef } from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import useNewMessages from "@/composables/useNewMessages";
import { useChatStore } from "@/stores/chat";
import { useRoomStore } from "@/stores/room";
import type { Room } from "@/types/room";
import type { Message } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";

const mockNewMessagesRef = ref<Message[]>([]);
const mockNewMessagesComputed = computed(() => mockNewMessagesRef.value);

vi.mock("@/composables/useNewMessages", () => ({
  default: vi.fn(() => mockNewMessagesRef),
}));

describe("chatStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockNewMessagesRef.value = [];
    vi.mocked(useNewMessages).mockReturnValue(mockNewMessagesComputed);
  });

  it("should initialize with default state values", () => {
    const chatStore = useChatStore();

    expect(chatStore.scrolledPx).toBe(0);
    expect(chatStore.scrollTemplateRef).toBeNull();
    expect(chatStore.isInitScrolled).toBe(false);
    expect(chatStore.isScrollDownButton).toBe(false);
    expect(chatStore.areNewMessages).toBe(false);
    expect(chatStore.newMessages).toEqual([]);
    expect(chatStore.newMessagesUserIds).toEqual([]);
  });

  describe("watcher: roomStore.room?.id", () => {
    it("should reset state when switching to a different room ID", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      roomStore.room = { id: "room-1" } as Room;
      await nextTick();

      chatStore.scrolledPx = 300;
      chatStore.scrollTemplateRef = {
        viewport: document.createElement("div"),
      } as UIScrollbarTemplateRef;

      chatStore.isInitScrolled = true;
      chatStore.isScrollDownButton = true;
      chatStore.areNewMessages = true;

      roomStore.room = { id: "room-2" } as Room;
      await nextTick();

      expect(chatStore.scrolledPx).toBe(0);
      expect(chatStore.scrollTemplateRef).toBeNull();
      expect(chatStore.isInitScrolled).toBe(false);
      expect(chatStore.isScrollDownButton).toBe(false);
      expect(chatStore.areNewMessages).toBe(false);
    });

    it("should not reset state if room ID remains the same", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      roomStore.room = { id: "room-1", extra: "General" } as Room & {
        extra: string;
      };

      await nextTick();

      chatStore.scrolledPx = 250;
      chatStore.isInitScrolled = true;

      roomStore.room = { id: "room-1", extra: "General Updated" } as Room & {
        extra: string;
      };

      await nextTick();

      expect(chatStore.scrolledPx).toBe(250);
      expect(chatStore.isInitScrolled).toBe(true);
    });
  });

  describe("watchEffect: isScrollDownButton", () => {
    it("should require scrolledPx > 200 when areNewMessages is false", async () => {
      const chatStore = useChatStore();
      chatStore.areNewMessages = false;

      chatStore.scrolledPx = 200;
      await nextTick();
      expect(chatStore.isScrollDownButton).toBe(false);

      chatStore.scrolledPx = 201;
      await nextTick();
      expect(chatStore.isScrollDownButton).toBe(true);
    });

    it("should require scrolledPx > 10 when areNewMessages is true", async () => {
      const chatStore = useChatStore();

      chatStore.areNewMessages = true;
      chatStore.scrolledPx = 10;

      await nextTick();
      expect(chatStore.isScrollDownButton).toBe(false);

      chatStore.scrolledPx = 11;

      await nextTick();
      expect(chatStore.isScrollDownButton).toBe(true);
    });
  });

  describe("computed: newMessagesUserIds", () => {
    it("should extract unique user IDs from newMessages list", () => {
      const chatStore = useChatStore();

      mockNewMessagesRef.value = [
        { id: "1", userId: "user-a" } as Message,
        { id: "2", userId: "user-b" } as Message,
        { id: "3", userId: "user-a" } as Message,
      ];

      expect(chatStore.newMessagesUserIds).toEqual(["user-a", "user-b"]);
    });
  });

  describe("action: scrollTo", () => {
    it("should do nothing if scrollTemplateRef or viewport is missing", () => {
      const chatStore = useChatStore();
      chatStore.scrollTemplateRef = null;

      expect(() => chatStore.scrollTo(10, 20)).not.toThrow();
    });

    it("should call viewport.scrollTo with default and custom coordinates and options", () => {
      const chatStore = useChatStore();
      const mockViewport = {
        scrollTo: vi.fn(),
      } as unknown as HTMLElement;

      chatStore.scrollTemplateRef = {
        viewport: mockViewport,
      } as UIScrollbarTemplateRef;

      chatStore.scrollTo();
      expect(mockViewport.scrollTo).toHaveBeenLastCalledWith({
        left: 0,
        top: 0,
      });

      chatStore.scrollTo(100, 500, { behavior: "smooth" });
      expect(mockViewport.scrollTo).toHaveBeenLastCalledWith({
        left: 100,
        top: 500,
        behavior: "smooth",
      });
    });
  });
});
