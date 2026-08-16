import type { UIScrollbarTemplateRef } from "@/components/ui/custom/scrollbar/UIScrollbar.vue";
import useChatAutoScroll from "@/composables/useChatAutoScroll";
import useIsRoomOpenedWindow from "@/composables/useIsRoomOpenedWindow";
import { useChatStore } from "@/stores/chat";
import { useRoomStore } from "@/stores/room";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, nextTick, ref } from "vue";

vi.mock("@/composables/useIsRoomOpenedWindow", () => ({
  default: vi.fn(),
}));

describe("useChatAutoScroll", () => {
  const isOpenedWindowRef = ref(false);
  const isOpenedWindowComputed = computed(() => isOpenedWindowRef.value);

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    isOpenedWindowRef.value = false;
    vi.mocked(useIsRoomOpenedWindow).mockReturnValue(isOpenedWindowComputed);
  });

  function createMockViewport(options: { scrollHeight?: number } = {}) {
    const elem = document.createElement("div");

    Object.defineProperty(elem, "scrollHeight", {
      value: options.scrollHeight ?? 1000,
      configurable: true,
    });

    return elem;
  }

  describe("guards and skip conditions", () => {
    it("should not scroll if room openedWindow is not 'chat'", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      chatStore.scrollTo = vi.fn();
      roomStore.openedWindow = "memberList";

      chatStore.scrollTemplateRef = {
        viewport: createMockViewport(),
      } as UIScrollbarTemplateRef;

      useChatAutoScroll();
      await nextTick();

      expect(chatStore.scrollTo).not.toHaveBeenCalled();
    });

    it("should not scroll if isOpenedWindow is true and isInitScrolled is already true", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      chatStore.scrollTo = vi.fn();

      roomStore.openedWindow = "chat";
      chatStore.isInitScrolled = true;

      isOpenedWindowRef.value = true;
      chatStore.scrollTemplateRef = {
        viewport: createMockViewport(),
      } as UIScrollbarTemplateRef;

      useChatAutoScroll();
      await nextTick();

      expect(chatStore.scrollTo).not.toHaveBeenCalled();
    });

    it("should not scroll if viewport element is missing", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      chatStore.scrollTo = vi.fn();
      roomStore.openedWindow = "chat";
      chatStore.scrollTemplateRef = null;

      useChatAutoScroll();
      await nextTick();

      expect(chatStore.scrollTo).not.toHaveBeenCalled();
    });

    it("should not scroll if viewport is inside a hidden card in opened window mode", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      chatStore.scrollTo = vi.fn();
      roomStore.openedWindow = "chat";

      isOpenedWindowRef.value = true;
      chatStore.isInitScrolled = false;

      const cardContainer = document.createElement("div");
      cardContainer.setAttribute("data-slot", "card");

      const viewport = createMockViewport();
      cardContainer.appendChild(viewport);
      document.body.appendChild(cardContainer);

      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        visibility: "hidden",
      } as CSSStyleDeclaration);

      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;

      useChatAutoScroll();
      await nextTick();

      expect(chatStore.scrollTo).not.toHaveBeenCalled();
      document.body.removeChild(cardContainer);
    });
  });

  describe("successful auto-scroll execution", () => {
    it("should scroll to bottom and mark isInitScrolled as true when in opened window mode", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      chatStore.scrollTo = vi.fn();
      roomStore.openedWindow = "chat";

      isOpenedWindowRef.value = true;
      chatStore.isInitScrolled = false;

      useChatAutoScroll();

      const viewport = createMockViewport({ scrollHeight: 1200 });
      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;

      await nextTick();

      expect(chatStore.scrollTo).toHaveBeenCalledExactlyOnceWith(0, 1200);
      expect(chatStore.isInitScrolled).toBe(true);
    });

    it("should scroll to bottom without setting isInitScrolled when NOT in opened window mode", async () => {
      const roomStore = useRoomStore();
      const chatStore = useChatStore();

      chatStore.scrollTo = vi.fn();
      roomStore.openedWindow = "chat";

      isOpenedWindowRef.value = false;
      chatStore.isInitScrolled = false;

      useChatAutoScroll();

      const viewport = createMockViewport({ scrollHeight: 850 });
      chatStore.scrollTemplateRef = { viewport } as UIScrollbarTemplateRef;

      await nextTick();

      expect(chatStore.scrollTo).toHaveBeenCalledExactlyOnceWith(0, 850);
      expect(chatStore.isInitScrolled).toBe(false);
    });
  });
});
