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
    it("should properly listen to REMOVE_USER error event and show toast error", async () => {
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

  describe("removeUser", () => {
    it("should emit REMOVE_USER event and push user id to userIdsToRemove", () => {
      const hostStore = useHostStore();
      const userId = "user-123";

      expect(hostStore.userIdsToRemove).toEqual([]);

      hostStore.removeUser(userId);
      expect(mockSocket.emit).toHaveBeenCalledExactlyOnceWith(
        SocketEvents.REMOVE_USER,
        { userId },
      );

      expect(hostStore.userIdsToRemove).toContain(userId);
    });

    it("should not emit socket event or duplicate user id if user is already being removed", () => {
      const hostStore = useHostStore();
      const userId = "user-123";

      hostStore.removeUser(userId);

      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
      expect(hostStore.userIdsToRemove).toEqual([userId]);

      hostStore.removeUser(userId);

      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
      expect(hostStore.userIdsToRemove).toEqual([userId]);
    });
  });
});
