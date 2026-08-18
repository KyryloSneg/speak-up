import useAreNewMessagesIndicator from "@/composables/useAreNewMessagesIndicator";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { mockUser } from "@/tests/utils/consts";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

describe("useAreNewMessagesIndicator", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("watcher: newMessagesUserIds", () => {
    it("should not update areNewMessages if user is not authenticated", async () => {
      const authStore = useAuthStore();
      const chatStore = useChatStore();
      const mockUserIds = ref<string[] | null>(null);

      vi.spyOn(chatStore, "newMessagesUserIds", "get").mockImplementation(
        () => mockUserIds.value || [],
      );

      authStore.user = null;
      chatStore.areNewMessages = false;

      useAreNewMessagesIndicator();

      mockUserIds.value = ["other-user-id"];
      await nextTick();

      expect(chatStore.areNewMessages).toBe(false);
    });

    it("should set areNewMessages to false when newMessagesUserIds is null or falsy", async () => {
      const authStore = useAuthStore();
      const chatStore = useChatStore();
      const mockUserIds = ref<string[] | null>(["other-user-id"]);

      vi.spyOn(chatStore, "newMessagesUserIds", "get").mockImplementation(
        () => mockUserIds.value || [],
      );

      authStore.user = mockUser;
      chatStore.areNewMessages = true;

      useAreNewMessagesIndicator();

      mockUserIds.value = null;
      await nextTick();

      expect(chatStore.areNewMessages).toBe(false);
    });

    it("should set areNewMessages to false if newMessagesUserIds contains only own user id", async () => {
      const authStore = useAuthStore();
      const chatStore = useChatStore();
      const mockUserIds = ref<string[] | null>(null);

      vi.spyOn(chatStore, "newMessagesUserIds", "get").mockImplementation(
        () => mockUserIds.value || [],
      );

      authStore.user = mockUser;
      chatStore.areNewMessages = true;

      useAreNewMessagesIndicator();

      mockUserIds.value = [mockUser.id];
      await nextTick();

      expect(chatStore.areNewMessages).toBe(false);
    });

    it("should set areNewMessages to true if newMessagesUserIds contains another user's id", async () => {
      const authStore = useAuthStore();
      const chatStore = useChatStore();
      const mockUserIds = ref<string[] | null>(null);

      vi.spyOn(chatStore, "newMessagesUserIds", "get").mockImplementation(
        () => mockUserIds.value || [],
      );

      authStore.user = mockUser;
      chatStore.areNewMessages = false;

      useAreNewMessagesIndicator();

      mockUserIds.value = [mockUser.id, "other-user-id"];
      await nextTick();

      expect(chatStore.areNewMessages).toBe(true);
    });
  });

  describe("watcher: isScrollDownButton", () => {
    it("should ignore isScrollDownButton change if areNewMessages is false", async () => {
      const chatStore = useChatStore();

      chatStore.areNewMessages = false;
      chatStore.isScrollDownButton = false;

      useAreNewMessagesIndicator();

      chatStore.isScrollDownButton = true;
      await nextTick();

      expect(chatStore.areNewMessages).toBe(false);
    });

    it("should update areNewMessages to isScrollDownButton value when areNewMessages is true", async () => {
      const chatStore = useChatStore();

      chatStore.areNewMessages = true;
      chatStore.isScrollDownButton = true;

      useAreNewMessagesIndicator();

      chatStore.isScrollDownButton = false;
      await nextTick();

      expect(chatStore.areNewMessages).toBe(false);
    });
  });
});
