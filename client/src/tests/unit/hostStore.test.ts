import { useHostStore } from "@/stores/host";
import mockSocket from "@/tests/unit/utils/mockSocket";
import { SocketEvents, SocketResponseEvents } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";

vi.mock("@/utils/socket", async () => ({
  default: (await import("@/tests/unit/utils/mockSocket")).default,
}));

vi.mock("vue-sonner", () => ({ toast: { error: vi.fn() } }));

describe("hostStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    mockSocket.resetMock();
    vi.clearAllMocks();
  });

  describe("bindEvents", () => {
    describe("send message event", () => {
      it("should properly handle an error remove user event", async () => {
        const hostStore = useHostStore();
        const error = "Unexpected Error";

        hostStore.bindEvents();
        hostStore.bindEvents();

        await mockSocket.triggerServerEvent(SocketResponseEvents.REMOVE_USER, {
          error,
        });

        expect(toast.error).toHaveBeenCalledExactlyOnceWith(error);
      });
    });
  });

  describe("removeUser", () => {
    it("should properly emit remove user event", () => {
      const hostStore = useHostStore();
      const userId = "userId" as const;

      hostStore.removeUser(userId);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.REMOVE_USER,
        { userId },
      );
    });
  });
});
